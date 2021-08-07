import yargs from "yargs";
import { commitAmendAction } from "../../actions/commit_amend";
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
    describe: "A new message for the commit",
    demandOption: false,
  },
  edit: {
    type: "boolean",
    describe: "Modify the existing commit message",
    demandOption: false,
    default: true,
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "amend";
export const description =
  "Amend the most recent commit and fix upstack branches.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await commitAmendAction({
      message: argv.message,
      noEdit: !argv.edit,
      addAll: argv.all,
    });
  });
};
