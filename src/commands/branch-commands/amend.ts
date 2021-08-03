import yargs from "yargs";
import { amendAction } from "../../actions/amend";
import { profile } from "../../lib/telemetry";

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

export const command = "amend";
export const description = "Commit staged changes and fix upstack branches.";
export const builder = args;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await amendAction(argv.silent, argv.message);
  });
};
