import {
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
} from "../lib/errors";
import { currentBranchPrecondition } from "../lib/preconditions";
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logInfo,
  rebaseInProgress,
  uncommittedChanges,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export async function fixAction(silent: boolean): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot fix with uncommitted changes");
  }
  const currentBranch = currentBranchPrecondition();
  if (currentBranch.name == getTrunk().name) {
    // Dont rebase main
    for (const child of await currentBranch.getChildrenFromMeta()) {
      await restackBranch(child, silent);
    }
  } else {
    await restackBranch(currentBranch, silent);
  }
  checkoutBranch(currentBranch.name);
}

export async function restackBranch(
  currentBranch: Branch,
  silent: boolean
): Promise<void> {
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

  if (parentBranch.ref() === mergeBase) {
    logInfo(
      `No fix needed for (${currentBranch.name}) on (${parentBranch.name})`
    );
  } else {
    logInfo(`Fixing (${currentBranch.name}) on (${parentBranch.name})`);
    checkoutBranch(currentBranch.name);
    currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
    gpExecSync(
      {
        command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${currentBranch.name}`,
        options: { stdio: "ignore" },
      },
      () => {
        if (rebaseInProgress()) {
          throw new RebaseConflictError(
            "Resolve the conflict (via `git rebase --continue`) and then rerun `gp stack fix` to fix the remaining stack."
          );
        }
      }
    );
  }

  for (const child of await currentBranch.getChildrenFromMeta()) {
    await restackBranch(child, silent);
  }
}
