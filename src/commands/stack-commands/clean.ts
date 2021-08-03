import yargs from "yargs";
import { cleanAction } from "../../actions/clean";
import { profile } from "../../lib/telemetry";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
  force: {
    describe: `Don't prompt on each branch to confirm deletion.`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "f",
  },
  pull: {
    describe: `Pull the trunk branch before comparison.`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "p",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "clean";
export const description =
  "Delete any branches that have been merged or squashed into the trunk branch, and fix their upstack branches recursively.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await cleanAction({
      silent: argv.silent,
      pull: argv.pull,
      force: argv.force,
    });
  });
};
