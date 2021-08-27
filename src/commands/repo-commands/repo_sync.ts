import yargs from "yargs";
import { syncAction } from "../../actions/sync";
import { profile } from "../../lib/telemetry";

const args = {
  force: {
    describe: `Don't prompt you to confirm when a branch will be deleted.`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "f",
  },
  pull: {
    describe: `Pull the trunk branch from remote before searching for stale branches.`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "p",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "sync";
export const aliases = ["s"];
export const description =
  "Delete any branches that have been merged or squashed into the trunk branch, and fix their upstack branches recursively.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await syncAction({
      pull: argv.pull,
      force: argv.force,
    });
  });
};
