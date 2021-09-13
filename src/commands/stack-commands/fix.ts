import yargs from "yargs";
import { fixAction } from "../../actions/fix";
import { ExitFailedError } from "../../lib/errors";
import { profile } from "../../lib/telemetry";

export const command = "fix";
export const canonical = "stack fix";
export const description =
  "Fix your stack of changes, either by recursively rebasing branches onto their parents, or by regenerating Graphite's stack metadata from the branch relationships in the git commit tree.";

const args = {
  rebase: {
    describe: `Fix your stack by recursively rebasing branches onto their parents, as recorded in Graphite's stack metadata.`,
    demandOption: false,
    default: false,
    type: "boolean",
  },
  regen: {
    describe: `Regenerate Graphite's stack metadata from the branch relationships in the git commit tree, overwriting the previous Graphite stack metadata.`,
    demandOption: false,
    default: false,
    type: "boolean",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const builder = args;
export const aliases = ["f"];

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    if (argv.rebase && argv.regen) {
      throw new ExitFailedError(
        'Please specify either the "--rebase" or "--regen" method, not both'
      );
    }
    await fixAction({
      action: argv.rebase ? "rebase" : argv.regen ? "regen" : undefined,
    });
  });
};
