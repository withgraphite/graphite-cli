import chalk from "chalk";
import yargs from "yargs";
import { userConfig } from "../../lib/config";
import { profile } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";

const args = {
  set: {
    demandOption: false,
    default: false,
    type: "string",
    alias: "s",
    describe: "Override the value of the branch-prefix in the Graphite config.",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "branch-prefix";
export const description =
  "The prefix which Graphite will prepend to all auto-generated branch names (i.e. when you don't specify a branch name when calling `gp branch create`).";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    if (argv.set) {
      userConfig.setBranchPrefix(argv.set);
      logInfo(`Set branch-prefix to "${chalk.green(argv.set)}"`);
    } else {
      logInfo(
        userConfig.getBranchPrefix() ||
          "branch-prefix is not set. Try running `gp user branch-prefix --set <prefix>` to update the value."
      );
    }
  });
};
