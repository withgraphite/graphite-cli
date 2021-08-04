import yargs from "yargs";
import { commitCreateAction } from "../../actions/commit_create";
import { profile } from "../../lib/telemetry";

const args = {
  all: {
    describe: `stage all changes before committing`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "a",
  },
  message: {
    type: "string",
    alias: "m",
    describe: "The message for the new commit",
    required: true,
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

export const command = "create";
export const description = "Create a new commit and fix upstack branches.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await commitCreateAction({
      message: argv.message,
      silent: argv.silent,
      addAll: argv.all,
    });
  });
};
