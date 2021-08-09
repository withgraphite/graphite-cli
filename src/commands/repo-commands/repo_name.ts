import yargs from "yargs";
import { repoConfig } from "../../lib/config";
import { profile } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";

const args = {
  set: {
    demandOption: false,
    default: false,
    type: "string",
    alias: "s",
    describe:
      "Override the value of the repo's name in the Graphite config. This is expected to match the name of the repo on GitHub and should only be set in cases where Graphite is incorrectly inferring the repo name.",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "name";
export const description =
  "The current repo's name stored in Graphite. e.g. in 'screenplaydev/graphite-cli', this is 'graphite-cli'.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    if (argv.set) {
      repoConfig.setRepoName(argv.set);
    } else {
      logInfo(repoConfig.getRepoName());
    }
  });
};
