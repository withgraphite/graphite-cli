import chalk from "chalk";
import { execSync } from "child_process";
import prompts from "prompts";
import { cache } from "../lib/config";
import { KilledError } from "../lib/errors";
import { checkoutBranch, getTrunk, logInfo } from "../lib/utils";
import Branch from "../wrapper-classes/branch";
import { deleteBranchAction } from "./delete_branch";
import { ontoAction } from "./onto";

// eslint-disable-next-line max-lines-per-function
export async function deleteMergedBranches(opts: {
  force: boolean;
  showDeleteProgress: boolean;
}): Promise<void> {
  const trunkChildren = getTrunk().getChildrenFromMeta();

  /**
   * To find and delete all of the merged branches, we traverse all of the
   * stacks off of trunk, greedily deleting the merged-in base branches and
   * rebasing the remaining branches.
   *
   * To greedily delete the branches, we keep track of the branches we plan
   * to delete as well as a live snapshot of their children. When a branch
   * we plan to delete has no more children, we know that it is safe to
   * eagerly delete.
   *
   * This eager deletion doesn't matter much in small repos, but matters
   * a lot if a repo has a lot of branches to delete. Whereas previously
   * any error in `repo sync` would throw away all of the work the command did
   * to determine what could and couldn't be deleted, now we take advantage
   * of that work as soon as we can.
   */
  let toProcess: Branch[] = trunkChildren;
  const branchesToDelete: Record<
    string,
    {
      branch: Branch;
      children: Branch[];
    }
  > = {};

  /**
   * Since we're doing a DFS, assuming rather even distribution of stacks off
   * of trunk children, we can trace the progress of the DFS through the trunk
   * children to give the user a sense of how far the repo sync has progressed.
   * Note that we only do this if the user has a large number of branches off
   * of trunk (> 50).
   */
  const trunkChildrenProgressMarkers: Record<string, string> = {};
  if (opts.showDeleteProgress) {
    trunkChildren.forEach((child, i) => {
      // Ignore the first child - don't show 0% progress.
      if (i === 0) {
        return;
      }

      trunkChildrenProgressMarkers[child.name] = `${+(
        // Add 1 to the overall children length to account for the fact that
        // when we're on the last trunk child, we're not 100% done - we need
        // to go through its stack.
        ((i / (trunkChildren.length + 1)) * 100).toFixed(2)
      )}%`;
    });
  }

  do {
    const branch = toProcess.shift();
    if (branch === undefined) {
      break;
    }

    if (branch.name in branchesToDelete) {
      continue;
    }

    if (
      opts.showDeleteProgress &&
      branch.name in trunkChildrenProgressMarkers
    ) {
      logInfo(
        `${
          trunkChildrenProgressMarkers[branch.name]
        } done searching for merged branches to delete...`
      );
    }

    const shouldDelete = await shouldDeleteBranch({
      branch: branch,
      force: opts.force,
    });
    if (shouldDelete) {
      const children = branch.getChildrenFromMeta();

      // We concat toProcess to children here (because we shift above) to make
      // our search a DFS.
      toProcess = children.concat(toProcess);

      branchesToDelete[branch.name] = {
        branch: branch,
        children: children,
      };
    } else {
      const parent = branch.getParentFromMeta();
      const parentName = parent?.name;

      // If we've reached this point, we know the branch shouldn't be deleted.
      // This means that we may need to rebase it - if the branch's parent is
      // going to be deleted.
      if (parentName !== undefined && parentName in branchesToDelete) {
        checkoutBranch(branch.name);
        logInfo(`upstacking (${branch.name}) onto (${getTrunk().name})`);
        await ontoAction(getTrunk().name);

        branchesToDelete[parentName].children = branchesToDelete[
          parentName
        ].children.filter((child) => child.name !== branch.name);
      }
    }

    checkoutBranch(getTrunk().name);

    // With either of the paths above, we may have unblocked a branch that can
    // be deleted immediately. We recursively check whether we can delete a
    // branch (until we can't), because the act of deleting one branch may free
    // up another.
    let branchToDeleteName;
    do {
      branchToDeleteName = Object.keys(branchesToDelete).find(
        (branchToDelete) =>
          branchesToDelete[branchToDelete].children.length === 0
      );
      if (branchToDeleteName === undefined) {
        continue;
      }

      const branch = branchesToDelete[branchToDeleteName].branch;
      const parentName = branch.getParentFromMeta()?.name;
      if (parentName !== undefined && parentName in branchesToDelete) {
        branchesToDelete[parentName].children = branchesToDelete[
          parentName
        ].children.filter((child) => child.name !== branch.name);
      }

      await deleteBranch(branch);
      delete branchesToDelete[branchToDeleteName];
    } while (branchToDeleteName !== undefined);
  } while (toProcess.length > 0);
}

async function shouldDeleteBranch(args: {
  branch: Branch;
  force: boolean;
}): Promise<boolean> {
  const merged = branchMerged(args.branch);
  if (!merged) {
    return false;
  }

  if (args.force) {
    return true;
  }

  const githubMergedBase =
    args.branch.getPRInfo()?.state === "MERGED"
      ? args.branch.getPRInfo()?.base
      : undefined;

  // If we've reached this point, we know that the branch was merged - it's
  // just a question of where. If it was merged on GitHub, we see where it was
  // merged into. If we don't detect that it was merged in GitHub but we do
  // see the code in trunk, we fallback to say that it was merged into trunk.
  // This extra check (rather than just saying trunk) is used to catch the
  // case where one feature branch is merged into another on GitHub.
  const mergedBase = githubMergedBase ?? getTrunk().name;

  const response = await prompts(
    {
      type: "confirm",
      name: "value",
      message: `Delete (${chalk.green(
        args.branch.name
      )}), which has been merged into (${mergedBase})?`,
      initial: true,
    },
    {
      onCancel: () => {
        throw new KilledError();
      },
    }
  );
  return response.value === true;
}

function branchMerged(branch: Branch): boolean {
  const prMerged = branch.getPRInfo()?.state === "MERGED";
  if (prMerged) {
    return true;
  }

  const branchName = branch.name;
  const trunk = getTrunk().name;
  const cherryCheckProvesMerged = execSync(
    `mergeBase=$(git merge-base ${trunk} ${branchName}) && git cherry ${trunk} $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $mergeBase -m _)`
  )
    .toString()
    .trim()
    .startsWith("-");
  if (cherryCheckProvesMerged) {
    return true;
  }

  const diffCheckProvesMerged =
    execSync(`git diff ${branchName} ${trunk} | wc -l`).toString().trim() ===
    "0";
  if (diffCheckProvesMerged) {
    return true;
  }

  return false;
}

async function deleteBranch(branch: Branch) {
  logInfo(`Deleting (${chalk.red(branch.name)})`);
  await deleteBranchAction({
    branchName: branch.name,
    force: true,
  });
  cache.clearAll();
}
