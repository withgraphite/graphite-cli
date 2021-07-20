import yargs from "yargs";
import { workingTreeClean } from "../../lib/git-utils";
import { gpExecSync, logInfo, logInternalErrorAndExit } from "../../lib/utils";
import AbstractCommand from "../abstract_command";
import RestackCommand from "../restack";

const args = {
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
export default class AmendCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    if (workingTreeClean()) {
      logInfo("No changes to amend.");
      return;
    }

    gpExecSync(
      {
        command: "git add --all",
      },
      (_) => {
        logInternalErrorAndExit("Failed to add changes. Aborting...");
      }
    );

    gpExecSync(
      {
        command: `git commit -m "${argv.message || "Updates"}"`,
      },
      (_) => {
        logInternalErrorAndExit("Failed to commit changes. Aborting...");
      }
    );
    await new RestackCommand().executeUnprofiled(args);
  }
}
