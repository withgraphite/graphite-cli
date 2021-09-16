import chalk from "chalk";
import { execSync } from "child_process";
import prompts from "prompts";
import { cache, repoConfig } from "../lib/config";
import {
  ExitFailedError,
  KilledError,
  PreconditionsFailedError
} from "../lib/errors";
import {
  cliAuthPrecondition,
  currentBranchPrecondition
} from "../lib/preconditions";
import { syncPRInfoForBranches } from "../lib/sync/pr_info";
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logInfo,
  uncommittedChanges
} from "../lib/utils";
import { logDebug, logNewline } from "../lib/utils/splog";
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
  const trunkChildren: Branch[] = getTrunk().getChildrenFromMeta();
  do {
    const branch = trunkChildren.pop();
    if (!branch) {
      break;
    }
    const children = branch.getChildrenFromMeta();
    if (!shouldDeleteBranch(branch)) {
      continue;
    }
    for (const child of children) {
      checkoutBranch(child.name);
      logInfo(`upstacking (${child.name}) onto (${getTrunk().name})`);
      await ontoAction(getTrunk().name);
      trunkChildren.push(child);
    }
    checkoutBranch(getTrunk().name);
    await deleteBranch({ branch: branch, force });
  } while (trunkChildren.length > 0);
}

function shouldDeleteBranch(branch: Branch): boolean {
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

async function deleteBranch(opts: { branch: Branch; force: boolean }) {
  if (!opts.force) {
    const githubMergedBase =
      opts.branch.getPRInfo()?.state === "MERGED"
        ? opts.branch.getPRInfo()?.base
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
          opts.branch.name
        )}), which has been merged into (${mergedBase})?`,
        initial: true,
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    );
    if (response.value != true) {
      return;
    }
  }
  logInfo(`Deleting (${chalk.red(opts.branch.name)})`);
  execSync(`git branch -D ${opts.branch.name}`);
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

  const trunk = getTrunk().name;
  for (const branch of danglingBranches) {
    let fix = force ? true : undefined;
    if (fix === undefined) {
      const response = await prompts(
        {
          type: "confirm",
          name: "value",
          message: `Set (${chalk.green(branch.name)})'s parent to (${trunk})?`,
          initial: true,
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      );
      fix = response.value;
    }
    if (fix) {
      branch.setParentBranchName(trunk);
    }
  }
}

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
  logInfo(
    [
      `Detected merge bases changes for:`,
      ...needsResubmission.map((b) => `- ${b.name}`),
    ].join("\n")
  );

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
