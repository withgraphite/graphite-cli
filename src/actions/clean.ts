import chalk from "chalk";
import { execSync } from "child_process";
import prompts from "prompts";
import { regenAction } from "../actions/fix";
import { ontoAction } from "../actions/onto";
import { ExitFailedError, PreconditionsFailedError } from "../lib/errors";
import { log } from "../lib/log";
import { currentBranchPrecondition } from "../lib/preconditions";
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  uncommittedChanges,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export async function cleanAction(opts: {
  pull: boolean;
  force: boolean;
  silent: boolean;
}): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot clean with uncommitted changes");
  }

  const oldBranch = currentBranchPrecondition();
  const trunk = getTrunk().name;

  const oldBranchName = oldBranch.name;
  checkoutBranch(trunk);
  if (opts.pull) {
    gpExecSync({ command: `git pull` }, () => {
      checkoutBranch(oldBranchName);
      throw new ExitFailedError(`Failed to pull trunk ${trunk}`);
    });
  }
  const trunkChildren: Branch[] = new Branch(trunk).getChildrenFromMeta();
  do {
    const branch = trunkChildren.pop();
    if (!branch) {
      break;
    }
    const children = branch.getChildrenFromMeta();
    if (!shouldDeleteBranch(branch.name)) {
      continue;
    }
    for (const child of children) {
      checkoutBranch(child.name);
      log(`upstacking (${child.name}) onto (${trunk})`);
      await ontoAction(trunk, true);
      trunkChildren.push(child);
    }
    checkoutBranch(trunk);
    await deleteBranch({ branchName: branch.name, ...opts });
    await regenAction(true);
  } while (trunkChildren.length > 0);
  checkoutBranch(oldBranchName);
}

function shouldDeleteBranch(branchName: string): boolean {
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

async function deleteBranch(opts: {
  branchName: string;
  force: boolean;
  silent: boolean;
}) {
  if (!opts.force) {
    const response = await prompts({
      type: "confirm",
      name: "value",
      message: `Delete (${chalk.green(
        opts.branchName
      )}), which has been merged into (${getTrunk().name})?`,
      initial: true,
    });
    if (response.value != true) {
      return;
    }
  } else {
    log(`Deleting (${chalk.red(opts.branchName)})`, opts);
  }
  execSync(`git branch -D ${opts.branchName}`);
}
