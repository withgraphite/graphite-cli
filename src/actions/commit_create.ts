import { execStateConfig } from "../lib/config";
import { ExitFailedError } from "../lib/errors";
import {
  ensureSomeStagedChangesPrecondition,
  uncommittedChangesPrecondition,
} from "../lib/preconditions";
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
      (err) => {
        throw new ExitFailedError("Failed to add changes. Aborting...", err);
      }
    );
  }

  ensureSomeStagedChangesPrecondition();

  gpExecSync(
    {
      command: [
        "git commit",
        `-m "${opts.message}"`,
        ...[execStateConfig.noVerify() ? ["--no-verify"] : []],
      ].join(" "),
    },
    (err) => {
      throw new ExitFailedError("Failed to commit changes. Aborting...", err);
    }
  );

  try {
    uncommittedChangesPrecondition();
    await fixAction({ action: "rebase" });
  } catch {
    logWarn(
      "Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix --rebase`"
    );
  }
}
