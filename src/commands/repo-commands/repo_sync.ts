import yargs from "yargs";
import { syncAction } from "../../actions/sync";
import { profile } from "../../lib/telemetry";

const args = {
  delete: {
    describe: `Delete branches which have been merged.`,
    demandOption: false,
    default: true,
    type: "boolean",
    alias: "d",
  },
  resubmit: {
    describe: `Re-submit branches whose merge bases have changed locally and now differ from their PRs.`,
    demandOption: false,
    default: true,
    type: "boolean",
    alias: "r",
  },
  force: {
    describe: `Don't prompt you to confirm when a branch will be deleted or re-submitted.`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "f",
  },
  pull: {
    describe: `Pull the trunk branch from remote before searching for stale branches.`,
    demandOption: false,
    default: true,
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
      resubmit: argv.resubmit,
      delete: argv.delete,
    });
  });
};
