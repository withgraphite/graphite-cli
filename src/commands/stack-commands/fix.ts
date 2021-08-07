import yargs from "yargs";
import { fixAction } from "../../actions/fix";
import { ExitFailedError } from "../../lib/errors";
import { profile } from "../../lib/telemetry";

export const command = "fix";
export const description =
  "Rebase any upstack branches onto the latest commit (HEAD) of the current branch.";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
  rebase: {
    describe: `Fix stack by recursively rebasing branches onto their parents as defined by Graphite stack metadata.`,
    demandOption: false,
    default: false,
    type: "boolean",
  },
  regen: {
    describe: `Regenerate Graphite stack metadata by walking the Git commit tree and finding branch parents.`,
    demandOption: false,
    default: false,
    type: "boolean",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const builder = args;
export const aliases = ["f"];

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    if (argv.rebase && argv.regen) {
      throw new ExitFailedError(
        'Please specify either "--rebase" or "--regen" flag, not both'
      );
    }
    await fixAction({
      silent: argv.silent,
      action: argv.rebase ? "rebase" : argv.regen ? "regen" : undefined,
    });
  });
};
