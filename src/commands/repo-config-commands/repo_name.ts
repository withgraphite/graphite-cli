import yargs from "yargs";
import { getRepoName, setRepoName } from "../../actions/repo_config";
import { profiledHandler } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";

const args = {
  set: {
    demandOption: false,
    default: false,
    type: "string",
    alias: "s",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "name";
export const description =
  "Graphite's conception of the current repo's name. e.g. in 'screenplaydev/graphite-cli', this is 'graphite-cli'.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profiledHandler(command, async () => {
    if (argv.set) {
      setRepoName(argv.set);
    } else {
      logInfo(getRepoName());
    }
  });
};
