import { execStateConfig } from "../lib/config";
import { ExitFailedError } from "../lib/errors";
import { uncommittedChangesPrecondition } from "../lib/preconditions";
import { gpExecSync, logWarn } from "../lib/utils";
import { fixAction } from "./fix";

export async function commitAmendAction(opts: {
  addAll: boolean;
  message?: string;
  noEdit: boolean;
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

  gpExecSync(
    {
      command: [
        `git commit --amend`,
        ...[
          opts.noEdit
            ? ["--no-edit"]
            : opts.message
            ? [`-m ${opts.message}`]
            : [],
        ],
        ...[execStateConfig.noVerify() ? ["--no-verify"] : []],
      ].join(" "),
      options: { stdio: "inherit" },
    },
    (err) => {
      throw new ExitFailedError("Failed to amend changes. Aborting...", err);
    }
  );
  // Only restack if working tree is now clean.
  try {
    uncommittedChangesPrecondition();
    await fixAction({ action: "rebase" });
  } catch {
    logWarn(
      "Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix --rebase`"
    );
  }
}
