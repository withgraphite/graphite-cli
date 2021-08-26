import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import yargs from "yargs";
import { currentGitRepoPrecondition } from "../../lib/config/repo_config";
import { ExitFailedError } from "../../lib/errors";
import { cache } from "../../lib/git-refs";
import { currentBranchPrecondition } from "../../lib/preconditions";
import { profile } from "../../lib/telemetry";
import { gpExecSync, logInfo } from "../../lib/utils";
import { Branch } from "../../wrapper-classes";

const args = {
  "new-branch-name": {
    describe: `The new name for the current branch`,
    demandOption: true,
    type: "string",
    positional: true,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "rename <new-branch-name>";
export const description =
  "Rename a branch and update metadata referencing it.";
export const builder = args;

export const handler = async (args: argsT): Promise<void> => {
  return profile(args, async () => {
    const currentBranch = currentBranchPrecondition();
    const gitRepoPath = currentGitRepoPrecondition();
    const oldName = currentBranch.name;
    const newName = args["new-branch-name"];
    const allBranches = Branch.allBranches();

    gpExecSync({ command: `git branch -m ${newName}` }, (err) => {
      throw new ExitFailedError(`Failed to rename the current branch.`, err);
    });

    // Good habit to clear cache after write operations.
    cache.clearAll();

    // Move the ref for the current branch.
    if (
      fs.existsSync(path.join(gitRepoPath, `refs/branch-metadata/${oldName}`))
    ) {
      fs.moveSync(
        path.join(gitRepoPath, `refs/branch-metadata/${oldName}`),
        path.join(gitRepoPath, `refs/branch-metadata/${newName}`)
      );
    }

    // Update any references to the branch.
    allBranches.forEach((branch) => {
      if (branch.getMeta()?.parentBranchName === oldName) {
        console.log(`changing ${branch.name} parent`);
        branch.setParentBranchName(newName);
      }
    });

    logInfo(`Successfully renamed (${oldName}) to (${chalk.green(newName)})`);
  });
};
