import { fixAction } from "../actions/fix";
import { ExitFailedError, PreconditionsFailedError } from "../lib/errors";
import { workingTreeClean } from "../lib/git-utils";
import { gpExecSync } from "../lib/utils";

export async function amendAction(
  silent: boolean,
  message?: string
): Promise<void> {
  if (workingTreeClean()) {
    throw new PreconditionsFailedError("No changes to amend.");
  }

  gpExecSync(
    {
      command: "git add --all",
    },
    () => {
      throw new ExitFailedError("Failed to add changes. Aborting...");
    }
  );

  gpExecSync(
    {
      command: `git commit -m "${message || "Updates"}"`,
    },
    () => {
      throw new ExitFailedError("Failed to commit changes. Aborting...");
    }
  );
  // Only restack if working tree is now clean.
  if (workingTreeClean()) {
    await fixAction(silent);
  }
}
