import chalk from 'chalk';
import { Branch } from '../../wrapper-classes/branch';
import { cache } from '../config/cache';
import { TContext } from '../context';
import { tracer } from '../telemetry/tracer';
import { gpExecSync } from '../utils/exec_sync';
import { getRef } from './branch_ref';

export function getBranchChildrenOrParentsFromGit(
  branch: Branch,
  opts: {
    direction: 'children' | 'parents';
    useMemoizedResults?: boolean;
  },
  context: TContext
): Branch[] {
  context.splog.logDebug(
    `Getting ${opts.direction} of ${branch.name} from git...`
  );
  const direction = opts.direction;
  const useMemoizedResults = opts.useMemoizedResults ?? false;
  return tracer.spanSync(
    {
      name: 'function',
      resource: 'branch.getChildrenOrParents',
      meta: { direction: direction },
    },
    () => {
      const gitTree = getRevListGitTree(
        {
          useMemoizedResults,
          direction: opts.direction,
        },
        context
      );

      const headSha = getRef(branch);

      const childrenOrParents = traverseGitTreeFromCommitUntilBranch(
        headSha,
        gitTree,
        getBranchList({ useMemoizedResult: useMemoizedResults }),
        0,
        context
      );

      if (childrenOrParents.shortCircuitedDueToMaxDepth) {
        context.splog.logDebug(
          `${chalk.magenta(
            `Potential missing branch ${direction.toLocaleLowerCase()}:`
          )} Short-circuited search for branch ${chalk.bold(
            branch.name
          )}'s ${direction.toLocaleLowerCase()} due to Graphite 'max-branch-length' setting. (Your Graphite CLI is currently configured to search a max of <${context.repoConfig.getMaxBranchLength()}> commits away from a branch's tip.) If this is causing an incorrect result (e.g. you know that ${
            branch.name
          } has ${direction.toLocaleLowerCase()} ${
            context.repoConfig.getMaxBranchLength() + 1
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

export function getRevListGitTree(
  opts: {
    useMemoizedResults: boolean;
    direction: 'parents' | 'children';
  },
  context: TContext
): Record<string, string[]> {
  if (opts.useMemoizedResults) {
    const cachedRevList =
      opts.direction === 'parents'
        ? cache.getParentsRevList()
        : cache.getChildrenRevList();

    if (cachedRevList) return cachedRevList;
  }
  const allBranches = Branch.allBranches(context)
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

function getBranchList(opts: {
  useMemoizedResult?: boolean;
}): Record<string, string[]> {
  const memoizedBranchList = cache.getBranchList();
  if (opts.useMemoizedResult && memoizedBranchList) {
    return memoizedBranchList;
  }

  return branchListFromShowRefOutput(
    gpExecSync({
      command: 'git show-ref --heads',
      options: { maxBuffer: 1024 * 1024 * 1024 },
    })
      .toString()
      .trim()
  );
}

function traverseGitTreeFromCommitUntilBranch(
  commit: string,
  gitTree: Record<string, string[]>,
  branchList: Record<string, string[]>,
  n: number,
  context: TContext
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
  const maxBranchLength = context.repoConfig.getMaxBranchLength();
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
      n + 1,
      context
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
  const newBranchList: Record<string, string[]> = {};

  for (const line of output.split('\n')) {
    if (line.length > 0) {
      const parts = line.split(' ');
      const branchName = parts[1].slice('refs/heads/'.length);
      const branchRef = parts[0];

      if (branchRef in newBranchList) {
        newBranchList[branchRef].push(branchName);
      } else {
        newBranchList[branchRef] = [branchName];
      }
    }
  }

  cache.setBranchList(newBranchList);
  return newBranchList;
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
