import chalk from "chalk";
import { execSync } from "child_process";
import prompts from "prompts";
import { ontoAction } from "../actions/onto";
import { regenAction } from "../actions/regen";
import { ExitFailedError, PreconditionsFailedError } from "../lib/errors";
import { log } from "../lib/log";
import { checkoutBranch, gpExecSync, uncommittedChanges } from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export async function cleanAction(opts: {
  trunk: string;
  pull: boolean;
  force: boolean;
  silent: boolean;
}): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot clean with uncommitted changes");
  }
  const oldBranch = Branch.getCurrentBranch();
  if (oldBranch === null) {
    throw new PreconditionsFailedError(
      "Not currently on a branch; no stack to clean."
    );
  }

  const oldBranchName = oldBranch.name;
  checkoutBranch(opts.trunk);
  if (opts.pull) {
    gpExecSync({ command: `git pull` }, () => {
      checkoutBranch(oldBranchName);
      throw new ExitFailedError(`Failed to pull trunk ${opts.trunk}`);
    });
  }
  const trunkChildren: Branch[] = await new Branch(
    opts.trunk
  ).getChildrenFromMeta();
  do {
    const branch = trunkChildren.pop()!;
    const children = await branch.getChildrenFromMeta();
    if (!shouldDeleteBranch(branch.name, opts.trunk)) {
      continue;
    }
    for (const child of children) {
      checkoutBranch(child.name);
      log(`upstacking (${child.name}) onto (${opts.trunk})`);
      await ontoAction(opts.trunk, true);
      trunkChildren.push(child);
    }
    checkoutBranch(opts.trunk);
    await deleteBranch({ branchName: branch.name, ...opts });
    await regenAction(true);
  } while (trunkChildren.length > 0);
  checkoutBranch(oldBranchName);
}

function shouldDeleteBranch(branchName: string, trunk: string): boolean {
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
  trunk: string;
  force: boolean;
  silent: boolean;
}) {
  if (!opts.force) {
    const response = await prompts({
      type: "confirm",
      name: "value",
      message: `Delete (${chalk.green(
        opts.branchName
      )}), which has been merged into (${opts.trunk})?`,
      initial: true,
    });
    if (response.value != true) {
      return;
    }
  } else {
    log(`Deleting ${opts.branchName}`, opts);
  }
  execSync(`git branch -D ${opts.branchName}`);
}
