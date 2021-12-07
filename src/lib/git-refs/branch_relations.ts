import chalk from 'chalk';
import Branch from '../../wrapper-classes/branch';
import { repoConfig } from '../config';
import cache from '../config/cache';
import { tracer } from '../telemetry';
import { gpExecSync } from '../utils';
import { logDebug } from '../utils';
import { getRef } from './branch_ref';

export function getBranchChildrenOrParentsFromGit(
  branch: Branch,
  opts: {
    direction: 'children' | 'parents';
    useMemoizedResults?: boolean;
  }
): Branch[] {
  const direction = opts.direction;
  const useMemoizedResults = opts.useMemoizedResults ?? false;
  return tracer.spanSync(
    {
      name: 'function',
      resource: 'branch.getChildrenOrParents',
      meta: { direction: direction },
    },
    () => {
      const gitTree = getRevListGitTree({
        useMemoizedResults,
        direction: opts.direction,
      });

      const headSha = getRef(branch);

      const childrenOrParents = traverseGitTreeFromCommitUntilBranch(
        headSha,
        gitTree,
        getBranchList({ useMemoizedResult: useMemoizedResults }),
        0
      );

      if (childrenOrParents.shortCircuitedDueToMaxDepth) {
        logDebug(
          `${chalk.magenta(
            `Potential missing branch ${direction.toLocaleLowerCase()}:`
          )} Short-circuited search for branch ${chalk.bold(
            branch.name
          )}'s ${direction.toLocaleLowerCase()} due to Graphite 'max-branch-length' setting. (Your Graphite CLI is currently configured to search a max of <${repoConfig.getMaxBranchLength()}> commits away from a branch's tip.) If this is causing an incorrect result (e.g. you know that ${
            branch.name
          } has ${direction.toLocaleLowerCase()} ${
            repoConfig.getMaxBranchLength() + 1
          } commits away), please adjust the setting using \`gt repo max-branch-length\`.`
        );
      }

      return Array.from(childrenOrParents.branches).map(
        (name) =>
          new Branch(name, {
            useMemoizedResults: branch.shouldUseMemoizedResults,
          })
      );
    }
  );
}

export function getRevListGitTree(opts: {
  useMemoizedResults: boolean;
  direction: 'parents' | 'children';
}): Record<string, string[]> {
  const cachedParentsRevList = cache.getParentsRevList();
  const cachedChildrenRevList = cache.getChildrenRevList();
  if (
    opts.useMemoizedResults &&
    opts.direction === 'parents' &&
    cachedParentsRevList
  ) {
    return cachedParentsRevList;
  } else if (
    opts.useMemoizedResults &&
    opts.direction === 'children' &&
    cachedChildrenRevList
  ) {
    return cachedChildrenRevList;
  }
  const allBranches = Branch.allBranches()
    .map((b) => b.name)
    .join(' ');
  const revList = gitTreeFromRevListOutput(
    gpExecSync({
      command:
        // Check that there is a commit behind this branch before getting the full list.
        `git rev-list --${opts.direction} ^$(git merge-base --octopus ${allBranches})~1 ${allBranches} 2> /dev/null || git rev-list --${opts.direction} --all`,
      options: {
        maxBuffer: 1024 * 1024 * 1024,
      },
    })
      .toString()
      .trim()
  );
  if (opts.direction === 'parents') {
    cache.setParentsRevList(revList);
  } else if (opts.direction === 'children') {
    cache.setChildrenRevList(revList);
  }
  return revList;
}

let memoizedBranchList: Record<string, string[]>;
function getBranchList(opts: {
  useMemoizedResult?: boolean;
}): Record<string, string[]> {
  if (opts.useMemoizedResult && memoizedBranchList !== undefined) {
    return memoizedBranchList;
  }

  memoizedBranchList = branchListFromShowRefOutput(
    gpExecSync({
      command: 'git show-ref --heads',
      options: { maxBuffer: 1024 * 1024 * 1024 },
    })
      .toString()
      .trim()
  );

  return memoizedBranchList;
}

function traverseGitTreeFromCommitUntilBranch(
  commit: string,
  gitTree: Record<string, string[]>,
  branchList: Record<string, string[]>,
  n: number
): {
  branches: Set<string>;
  shortCircuitedDueToMaxDepth?: boolean;
} {
  // Skip the first iteration b/c that is the CURRENT branch
  if (n > 0 && commit in branchList) {
    return {
      branches: new Set(branchList[commit]),
    };
  }

  // Limit the search
  const maxBranchLength = repoConfig.getMaxBranchLength();
  if (n > maxBranchLength) {
    return {
      branches: new Set(),
      shortCircuitedDueToMaxDepth: true,
    };
  }

  if (!gitTree[commit] || gitTree[commit].length == 0) {
    return {
      branches: new Set(),
    };
  }

  const commitsMatchingBranches = new Set<string>();
  let shortCircuitedDueToMaxDepth = undefined;
  for (const neighborCommit of gitTree[commit]) {
    const results = traverseGitTreeFromCommitUntilBranch(
      neighborCommit,
      gitTree,
      branchList,
      n + 1
    );

    const branches = results.branches;
    shortCircuitedDueToMaxDepth =
      results.shortCircuitedDueToMaxDepth || shortCircuitedDueToMaxDepth;

    if (branches.size !== 0) {
      branches.forEach((commit) => {
        commitsMatchingBranches.add(commit);
      });
    }
  }
  return {
    branches: commitsMatchingBranches,
    shortCircuitedDueToMaxDepth: shortCircuitedDueToMaxDepth,
  };
}

function branchListFromShowRefOutput(output: string): Record<string, string[]> {
  const ret: Record<string, string[]> = {};

  for (const line of output.split('\n')) {
    if (line.length > 0) {
      const parts = line.split(' ');
      const branchName = parts[1].slice('refs/heads/'.length);
      const branchRef = parts[0];

      if (!repoConfig.branchIsIgnored(branchName)) {
        logDebug(`branch ${branchName} is not ignored`);
        if (branchRef in ret) {
          ret[branchRef].push(branchName);
        } else {
          ret[branchRef] = [branchName];
        }
      }
    }
  }

  return ret;
}

function gitTreeFromRevListOutput(output: string): Record<string, string[]> {
  const ret: Record<string, string[]> = {};
  for (const line of output.split('\n')) {
    if (line.length > 0) {
      const shas = line.split(' ');
      ret[shas[0]] = shas.slice(1);
    }
  }

  return ret;
}
