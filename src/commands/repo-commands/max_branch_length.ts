import yargs from "yargs";
import { repoConfig } from "../../lib/config";
import { profile } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";

const args = {
  set: {
    demandOption: false,
    default: false,
    type: "number",
    alias: "s",
    describe:
      "Override the max number of commits on a branch Graphite will track.",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "max-branch-length";
export const canonical = "repo max-branch-length";
export const description =
  "Graphite will track up to this many commits on a branch. e.g. If this is set to 50, Graphite can track branches up to 50 commits long. Increasing this setting may result in slower performance for Graphite.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    if (argv.set) {
      repoConfig.setMaxBranchLength(argv.set);
    } else {
      logInfo(`${repoConfig.getMaxBranchLength().toString()} commits`);
    }
  });
};
