import chalk from "chalk";
import { execSync } from "child_process";
import prompts from "prompts";
import { cache, repoConfig } from "../lib/config";
import {
  ExitFailedError,
  KilledError,
  PreconditionsFailedError,
} from "../lib/errors";
import {
  cliAuthPrecondition,
  currentBranchPrecondition,
} from "../lib/preconditions";
import { syncPRInfoForBranches } from "../lib/sync/pr_info";
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logInfo,
  uncommittedChanges,
} from "../lib/utils";
import { logDebug, logNewline, logTip } from "../lib/utils/splog";
import Branch from "../wrapper-classes/branch";
import MetadataRef from "../wrapper-classes/metadata_ref";
import { ontoAction } from "./onto";
import { submitBranches } from "./submit";

export async function syncAction(opts: {
  pull: boolean;
  force: boolean;
  delete: boolean;
  resubmit: boolean;
  fixDanglingBranches: boolean;
}): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot sync with uncommitted changes");
  }
  const oldBranch = currentBranchPrecondition();
  const trunk = getTrunk().name;
  checkoutBranch(trunk);

  if (opts.pull) {
    logNewline();
    logInfo(`Pulling in new changes...`);
    logTip(`Disable this behavior at any point in the future with --no-pull`);
    gpExecSync({ command: `git pull` }, (err) => {
      checkoutBranch(oldBranch.name);
      throw new ExitFailedError(`Failed to pull trunk ${trunk}`, err);
    });
  }

  await syncPRInfoForBranches(Branch.allBranches());

  // This needs to happen before we delete/resubmit so that we can potentially
  // delete or resubmit on the dangling branches.
  if (opts.fixDanglingBranches) {
    await fixDanglingBranches(opts.force);
  }

  if (opts.delete) {
    await deleteMergedBranches(opts.force);
  }

  if (opts.resubmit) {
    await resubmitBranchesWithNewBases(opts.force);
  }

  checkoutBranch(Branch.exists(oldBranch.name) ? oldBranch.name : trunk);
  cleanDanglingMetadata();
}

async function deleteMergedBranches(force: boolean): Promise<void> {
  logNewline();
  logInfo(`Checking if any branches have been merged and can be deleted...`);
  logTip(`Disable this behavior at any point in the future with --no-delete`);

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
  let toProcess: Branch[] = getTrunk().getChildrenFromMeta();
  const branchesToDelete: Record<
    string,
    {
      branch: Branch;
      children: Branch[];
    }
  > = {};

  do {
    const branch = toProcess.pop();
    if (branch === undefined) {
      break;
    }

    if (branch.name in branchesToDelete) {
      continue;
    }

    const shouldDelete = await shouldDeleteBranch({
      branch: branch,
      force: force,
    });
    if (shouldDelete) {
      const children = branch.getChildrenFromMeta();

      // We concat here (because we pop above) to make our search a DFS.
      toProcess = toProcess.concat(children);

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
  execSync(`git branch -D ${branch.name}`);
  cache.clearAll();
}

async function fixDanglingBranches(force: boolean): Promise<void> {
  const danglingBranches = Branch.allBranchesWithFilter({
    filter: (b) => !b.isTrunk() && b.getParentFromMeta() === undefined,
  });
  if (danglingBranches.length === 0) {
    return;
  }

  logNewline();
  console.log(
    chalk.yellow(
      `Detected branches in Graphite without a known parent. Suggesting a fix...`
    )
  );
  logTip(
    `Disable this behavior at any point in the future with --no-show-dangling`
  );

  const trunk = getTrunk().name;
  for (const branch of danglingBranches) {
    type TFixStrategy = "parent_trunk" | "ignore_branch" | "no_fix" | undefined;
    let fixStrategy: TFixStrategy | undefined = undefined;

    if (force) {
      fixStrategy = "parent_trunk";
      logInfo(`Setting parent of ${branch.name} to ${trunk}.`);
    }

    if (fixStrategy === undefined) {
      const response = await prompts(
        {
          type: "select",
          name: "value",
          message: `${branch.name}`,
          choices: [
            {
              title: `Set ${chalk.green(
                `(${branch.name})`
              )}'s parent to ${trunk}`,
              value: "parent_trunk",
            },
            {
              title: `Add ${chalk.green(
                `(${branch.name})`
              )} to the list of branches Graphite should ignore`,
              value: "ignore_branch",
            },
            { title: `Fix later`, value: "no_fix" },
          ],
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      );

      switch (response.value) {
        case "parent_trunk":
          fixStrategy = "parent_trunk";
          break;
        case "ignore_branch":
          fixStrategy = "ignore_branch";
          break;
        case "no_fix":
        default:
          fixStrategy = "no_fix";
      }
    }

    switch (fixStrategy) {
      case "parent_trunk":
        branch.setParentBranchName(trunk);
        break;
      case "ignore_branch":
        repoConfig.addIgnoredBranches([branch.name]);
        break;
      case "no_fix":
        break;
      default:
        assertUnreachable(fixStrategy);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}

function cleanDanglingMetadata(): void {
  const allMetadataRefs = MetadataRef.allMetadataRefs();
  const allBranches = Branch.allBranches();
  allMetadataRefs.forEach((ref) => {
    if (!allBranches.find((b) => b.name === ref._branchName)) {
      logDebug(`Deleting metadata for ${ref._branchName}`);
      ref.delete();
    }
  });
}

async function resubmitBranchesWithNewBases(force: boolean): Promise<void> {
  const needsResubmission: Branch[] = [];
  Branch.allBranchesWithFilter({
    filter: (b) => {
      const prState = b.getPRInfo()?.state;
      return (
        !b.isTrunk() &&
        b.getParentFromMeta() !== undefined &&
        prState !== "MERGED" &&
        prState !== "CLOSED"
      );
    },
  }).forEach((b) => {
    const currentBase = b.getParentFromMeta()?.name;
    const githubBase = b.getPRInfo()?.base;

    if (githubBase && githubBase !== currentBase) {
      needsResubmission.push(b);
    }
  });

  if (needsResubmission.length === 0) {
    return;
  }

  logNewline();
  logInfo(
    [
      `Detected merge bases changes for:`,
      ...needsResubmission.map((b) => `- ${b.name}`),
    ].join("\n")
  );
  logTip(`Disable this behavior at any point in the future with --no-resubmit`);

  // Prompt for resubmission.
  let resubmit: boolean = force;
  if (!force) {
    const response = await prompts({
      type: "confirm",
      name: "value",
      message: `Update remote PR mergebases to match local?`,
      initial: true,
    });
    resubmit = response.value;
  }
  if (resubmit) {
    logInfo(`Updating outstanding PR mergebases...`);
    const cliAuthToken = cliAuthPrecondition();
    const repoName = repoConfig.getRepoName();
    const repoOwner = repoConfig.getRepoOwner();
    await submitBranches({
      branchesToSubmit: needsResubmission,
      cliAuthToken: cliAuthToken,
      repoOwner: repoOwner,
      repoName: repoName,
      editPRFieldsInline: false,
      createNewPRsAsDraft: false,
    });
  }
}
