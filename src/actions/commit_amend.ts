import { ExitFailedError } from "../lib/errors";
import { workingTreeClean } from "../lib/git-utils";
import { gpExecSync, logWarn } from "../lib/utils";
import { fixAction } from "./fix";

export async function commitAmendAction(opts: {
  addAll: boolean;
  message?: string;
  noEdit: boolean;
  noVerify: boolean;
  silent: boolean;
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
        ...[opts.noVerify ? ["--no-verify"] : []],
      ].join(" "),
    },
    () => {
      throw new ExitFailedError("Failed to amend changes. Aborting...");
    }
  );
  // Only restack if working tree is now clean.
  if (workingTreeClean()) {
    await fixAction(opts.silent);
  } else {
    logWarn(
      "Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gp stack fix`"
    );
  }
}
