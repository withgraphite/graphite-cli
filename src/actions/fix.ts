import {
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
} from "../lib/errors";
import { log } from "../lib/log";
import { currentBranchPrecondition } from "../lib/preconditions";
import {
  checkoutBranch,
  gpExecSync,
  rebaseInProgress,
  uncommittedChanges,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export async function fixAction(silent: boolean): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot fix with uncommitted changes");
  }

  const originalBranch = currentBranchPrecondition();

  const childrenRestackedByBranchName: Record<string, number> = {};
  for (const child of await originalBranch.getChildrenFromMeta()) {
    const childRestack = await restackBranch(child, silent);
    childrenRestackedByBranchName[child.name] = childRestack.numberRestacked;
  }
  checkoutBranch(originalBranch.name);

  log(`Fixed:`, { silent });
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
    throw new RebaseConflictError(
      `Interactive rebase in progress, cannot fix (${currentBranch.name}). Complete the rebase and re-run fix command.`
    );
  }
  const parentBranch = currentBranch.getParentFromMeta();
  if (!parentBranch) {
    throw new ExitFailedError(
      `Cannot find parent in stack for (${currentBranch.name}), stopping fix`
    );
  }
  const mergeBase = currentBranch.getMetaMergeBase();
  if (!mergeBase) {
    throw new ExitFailedError(
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
        throw new RebaseConflictError(
          "Please resolve the rebase conflict and then continue with your `stack fix` command."
        );
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
