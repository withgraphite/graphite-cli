import chalk from "chalk";
import { execSync } from "child_process";
import { getTrunk } from ".";
import { Branch } from "../../wrapper-classes";
import { repoConfig } from "../config";
import { tracer } from "../telemetry";
import { logDebug } from "./splog";

export function getBranchChildrenOrParentsFromGit(
  branch: Branch,
  opts: {
    direction: "CHILDREN" | "PARENTS";
    useMemoizedResults?: boolean;
  }
): Branch[] {
  const direction = opts.direction;
  const useMemoizedResults = opts.useMemoizedResults ?? false;
  return tracer.spanSync(
    {
      name: "function",
      resource: "branch.getChildrenOrParents",
      meta: { direction: direction },
    },
    () => {
      const gitTree =
        direction === "CHILDREN"
          ? getChildrenRevListGitTree(branch.name)
          : getParentRevListGitTree(branch.name);
      const headSha = execSync(`git rev-parse ${branch.name}`)
        .toString()
        .trim();

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

      return Array.from(childrenOrParents.branches).map((name) => {
        const branch = new Branch(name);
        return branch.shouldUseMemoizedResults
          ? branch.useMemoizedResults()
          : branch;
      });
    }
  );
}

function getChildrenRevListGitTree(
  branchName: string
): Record<string, string[]> {
  const otherBranches = Branch.allBranches()
    .map((b) => b.name)
    .filter((b) => b !== branchName);

  return gitTreeFromRevListOutput(
    execSync(
      // Check that there is a commit behind this branch before getting the full list.
      `git show-ref ${branchName}~1 && git rev-list --children ${otherBranches.join(
        " "
        // If there are no commits behind current, just fetch all refs.
      )} ^${branchName}~1 || git rev-list --children --all`,
      {
        maxBuffer: 1024 * 1024 * 1024,
      }
    )
      .toString()
      .trim()
  );
}

function getParentRevListGitTree(branchName: string): Record<string, string[]> {
  return gitTreeFromRevListOutput(
    execSync(`git rev-list --parents ${branchName} ^${getTrunk().name}`, {
      maxBuffer: 1024 * 1024 * 1024,
    })
      .toString()
      .trim()
  );
}

let memoizedBranchList: Record<string, string[]>;
function getBranchList(opts: {
  useMemoizedResult?: boolean;
}): Record<string, string[]> {
  if (opts.useMemoizedResult && memoizedBranchList !== undefined) {
    return memoizedBranchList;
  }

  memoizedBranchList = branchListFromShowRefOutput(
    execSync("git show-ref --heads", {
      maxBuffer: 1024 * 1024 * 1024,
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

  // Limit the seach
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
  const ignorebranches = repoConfig.getIgnoreBranches();

  for (const line of output.split("\n")) {
    if (line.length > 0) {
      const parts = line.split(" ");
      const branchName = parts[1].slice("refs/heads/".length);
      const branchRef = parts[0];
      if (!ignorebranches.includes(branchName)) {
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
  for (const line of output.split("\n")) {
    if (line.length > 0) {
      const shas = line.split(" ");
      ret[shas[0]] = shas.slice(1);
    }
  }

  return ret;
}
