import yargs from "yargs";
import { getRepoOwner, setRepoOwner } from "../../actions/repo_config";
import { profiledHandler } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";

const args = {
  set: {
    demandOption: false,
    default: false,
    type: "string",
    alias: "s",
    describe:
      "Override the value of the repo owner's name in the Graphite config. This is expected to match the name of the repo owner on GitHub and should only be set in cases where Graphite is incorrectly inferring the name.",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "owner";
export const description =
  "Graphite's conception of the current repo's owner. e.g. in 'screenplaydev/graphite-cli', this is 'screenplaydev'.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profiledHandler(command, async () => {
    if (argv.set) {
      setRepoOwner(argv.set);
    } else {
      logInfo(getRepoOwner());
    }
  });
};
