import { execSync } from "child_process";
import { ExitFailedError } from "../lib/errors";
import { workingTreeClean } from "../lib/git-utils";
import { globalArgs } from "../lib/global-arguments";
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
      () => {
        throw new ExitFailedError("Failed to add changes. Aborting...");
      }
    );
  }

  try {
    execSync(
      [
        `git commit --amend`,
        ...[
          opts.noEdit
            ? ["--no-edit"]
            : opts.message
            ? [`-m ${opts.message}`]
            : [],
        ],
        ...[globalArgs.noVerify ? ["--no-verify"] : []],
      ].join(" "),
      { stdio: "inherit" }
    );
  } catch {
    throw new ExitFailedError("Failed to amend changes. Aborting...");
  }
  // Only restack if working tree is now clean.
  if (workingTreeClean()) {
    await fixAction({ action: "rebase" });
  } else {
    logWarn(
      "Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix`"
    );
  }
}
