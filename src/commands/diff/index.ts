import { execSync } from "child_process";
import yargs from "yargs";
import { workingTreeClean } from "../../lib/git-utils";
import { logErrorAndExit, makeId, userConfig } from "../../lib/utils";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";

const args = {
  "branch-name": {
    type: "string",
    alias: "b",
    describe: "The name of the target which builds your app for release",
  },
  message: {
    type: "string",
    alias: "m",
    describe: "The message for the new commit",
  },
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export default class DiffCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    const parentBranch = Branch.getCurrentBranch();
    if (parentBranch === null) {
      logErrorAndExit(
        `Cannot find current branch. Please ensure you're running this command atop a checked-out branch.`
      );
    }

    const branchName =
      argv["branch-name"] || `${userConfig.branchPrefix || ""}${makeId(6)}`;

    execSync(
      `git checkout -b "${branchName}"`,
      argv.silent ? { stdio: "ignore" } : {}
    );

    if (!workingTreeClean()) {
      execSync("git add --all");
      execSync(`git commit -m "${argv.message || "Updates"}"`);
    }

    const currentBranch = Branch.getCurrentBranch();
    if (currentBranch === null) {
      logErrorAndExit(
        `Created but failed to checkout ${branchName}. Please try again.`
      );
    }

    currentBranch.setParentBranchName(parentBranch.name);
  }
}
