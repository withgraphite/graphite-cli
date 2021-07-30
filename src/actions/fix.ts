import chalk from "chalk";
import { log } from "../lib/log";
import {
  checkoutBranch,
  gpExecSync,
  logErrorAndExit,
  rebaseInProgress,
  uncommittedChanges,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export async function fixAction(silent: boolean): Promise<void> {
  if (uncommittedChanges()) {
    logErrorAndExit("Cannot fix with uncommitted changes");
  }

  const originalBranch = Branch.getCurrentBranch();
  if (originalBranch === null) {
    logErrorAndExit(`Not currently on a branch; no target to fix.`);
  }

  const childrenRestackedByBranchName: Record<string, number> = {};
  for (const child of await originalBranch.getChildrenFromMeta()) {
    const childRestack = await restackBranch(child, silent);
    childrenRestackedByBranchName[child.name] = childRestack.numberRestacked;
  }
  checkoutBranch(originalBranch.name);

  log(`Restacked:`, { silent });
  for (const branchName of Object.keys(childrenRestackedByBranchName)) {
    const childrenRestacked = childrenRestackedByBranchName[branchName] - 1; // subtracting 1 for branch
    log(
      ` - ${branchName} ${
        childrenRestacked > 0
          ? `(${childrenRestacked} descendent${
              childrenRestacked === 1 ? "" : "s"
            })`
          : ""
      }`,
      { silent }
    );
  }
}

export async function restackBranch(
  currentBranch: Branch,
  silent: boolean
): Promise<{ numberRestacked: number }> {
  if (rebaseInProgress()) {
    logErrorAndExit(
      `Interactive rebase in progress, cannot fix (${currentBranch.name}). Complete the rebase and re-run fix command.`
    );
  }
  const parentBranch = currentBranch.getParentFromMeta();
  if (!parentBranch) {
    logErrorAndExit(
      `Cannot find parent in stack for (${currentBranch.name}), stopping fix`
    );
  }
  const mergeBase = currentBranch.getMetaMergeBase();
  if (!mergeBase) {
    logErrorAndExit(
      `Cannot find a merge base in the stack for (${currentBranch.name}), stopping fix`
    );
  }

  currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
  checkoutBranch(currentBranch.name);
  gpExecSync(
    {
      command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${currentBranch.name}`,
      options: { stdio: "ignore" },
    },
    () => {
      if (rebaseInProgress()) {
        log(
          chalk.yellow(
            "Please resolve the rebase conflict and then continue with your `stack fix` command."
          )
        );
        process.exit(0);
      }
    }
  );

  let numberRestacked = 1; // 1 for self
  for (const child of await currentBranch.getChildrenFromMeta()) {
    const childRestack = await restackBranch(child, silent);
    numberRestacked += childRestack.numberRestacked;
  }

  return { numberRestacked };
}
