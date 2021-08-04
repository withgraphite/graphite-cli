import { userConfig } from "../lib/config";
import { ExitFailedError, PreconditionsFailedError } from "../lib/errors";
import { currentBranchPrecondition } from "../lib/preconditions";
import {
  checkoutBranch,
  detectStagedChanges,
  gpExecSync,
  makeId,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export async function createBranchAction(opts: {
  silent: boolean;
  noVerify: boolean;
  branchName?: string;
  message?: string;
}): Promise<void> {
  const parentBranch = currentBranchPrecondition();

  ensureSomeStagedChanges(opts.silent);

  const branchName = newBranchName(opts.branchName);
  checkoutNewBranch(branchName, opts.silent);

  /**
   * Here, we silence errors and ignore them. This
   * isn't great but our main concern is that we're able to create
   * and check out the new branch and these types of error point to
   * larger failure outside of our control.
   */
  gpExecSync(
    {
      command: `git commit -m "${opts.message || "Updates"}" ${
        opts.noVerify ? "--no-verify" : ""
      }`,
      options: {
        stdio: "inherit",
      },
    },
    () => {
      // Commit failed, usually due to precommit hooks. Rollback the branch.
      checkoutBranch(parentBranch.name);
      gpExecSync({
        command: `git branch -d ${branchName}`,
        options: { stdio: "ignore" },
      });
      throw new ExitFailedError("Failed to commit changes, aborting");
    }
  );

  const currentBranch = Branch.getCurrentBranch();
  if (currentBranch === null) {
    throw new ExitFailedError(
      `Created but failed to checkout ${branchName}. Please try again.`
    );
  }

  currentBranch.setParentBranchName(parentBranch.name);
}

function ensureSomeStagedChanges(silent: boolean): void {
  if (!detectStagedChanges()) {
    if (!silent) {
      gpExecSync({ command: `git status`, options: { stdio: "inherit" } });
    }

    throw new PreconditionsFailedError(
      `Cannot "branch create", no staged changes detected.`
    );
  }
}

function newBranchName(branchName?: string): string {
  return branchName || `${userConfig.getBranchPrefix() || ""}${makeId(6)}`;
}

function checkoutNewBranch(branchName: string, silent: boolean): void {
  gpExecSync(
    {
      command: `git checkout -b "${branchName}"`,
      options: silent ? { stdio: "ignore" } : {},
    },
    (_) => {
      throw new ExitFailedError(`Failed to checkout new branch ${branchName}`);
    }
  );
}
