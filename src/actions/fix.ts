import chalk from "chalk";
import PrintStacksCommand from "../commands/original-commands/print-stacks";
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
  // Print state before
  log(`Before fix:`, { silent });
  !silent && (await new PrintStacksCommand().executeUnprofiled({ silent }));

  const originalBranch = Branch.getCurrentBranch();
  if (originalBranch === null) {
    logErrorAndExit(`Not currently on a branch; no target to fix.`);
  }

  for (const child of await originalBranch.getChildrenFromMeta()) {
    await restackBranch(child, silent);
  }
  checkoutBranch(originalBranch.name);

  // Print state after
  log(`After fix:`, { silent });
  !silent && (await new PrintStacksCommand().executeUnprofiled({ silent }));
}

export async function restackBranch(
  currentBranch: Branch,
  silent: boolean
): Promise<void> {
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
            "Please resolve the rebase conflict (via `git rebase --continue`) and then rerun `stack fix` to fix the remainder of the stack."
          )
        );
        process.exit(0);
      }
    }
  );

  for (const child of await currentBranch.getChildrenFromMeta()) {
    await restackBranch(child, silent);
  }
}
