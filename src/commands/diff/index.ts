import yargs from "yargs";
import { workingTreeClean } from "../../lib/git-utils";
import {
  gpExecSync,
  logErrorAndExit,
  logInternalErrorAndExit,
  makeId,
  userConfig,
} from "../../lib/utils";
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

    gpExecSync(
      {
        command: `git checkout -b "${branchName}"`,
        options: argv.silent ? { stdio: "ignore" } : {},
      },
      (_) => {
        logInternalErrorAndExit(`Failed to checkout new branch ${branchName}`);
      }
    );

    if (!workingTreeClean()) {
      /**
       * For these 2 commands, we silence errors and ignore them. This
       * isn't great but our main concern is that we're able to create
       * and check out the new branch and these types of error point to
       * larger failure outside of our control.
       */
      gpExecSync(
        {
          command: "git add --all",
          options: {
            stdio: [
              "pipe", // stdin
              "pipe", // stdout
              "ignore", // stderr
            ],
          },
        },
        (_) => {
          return Buffer.alloc(0);
        }
      );
      gpExecSync(
        {
          command: `git commit -m "${argv.message || "Updates"}"`,
          options: {
            stdio: [
              "pipe", // stdin
              "pipe", // stdout
              "ignore", // stderr
            ],
          },
        },
        (_) => {
          return Buffer.alloc(0);
        }
      );
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
