import { ExitFailedError } from "../lib/errors";
import { workingTreeClean } from "../lib/git-utils";
import { globalArgs } from "../lib/global-arguments";
import { ensureSomeStagedChangesPrecondition } from "../lib/preconditions";
import { gpExecSync, logWarn } from "../lib/utils";
import { fixAction } from "./fix";

export async function commitCreateAction(opts: {
  addAll: boolean;
  message: string;
}): Promise<void> {
  if (opts.addAll) {
    gpExecSync(
      {
        command: "git add --all",
      },
      () => {
        throw new ExitFailedError("Failed to add changes. Aborting...");
      }
    );
  }

  ensureSomeStagedChangesPrecondition();

  gpExecSync(
    {
      command: [
        "git commit",
        `-m "${opts.message}"`,
        ...[globalArgs.noVerify ? ["--no-verify"] : []],
      ].join(" "),
    },
    () => {
      throw new ExitFailedError("Failed to commit changes. Aborting...");
    }
  );
  // Only restack if working tree is now clean.
  if (workingTreeClean()) {
    await fixAction({ action: "rebase" });
  } else {
    logWarn(
      "Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix`"
    );
  }
}
