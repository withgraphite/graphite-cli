import yargs from "yargs";
import { userConfig } from "../../lib/config";
import { profile } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";

const args = {
  enable: {
    demandOption: false,
    default: true,
    type: "boolean",
    describe: "Enable tips.",
  },
  disable: {
    demandOption: false,
    default: true,
    type: "boolean",
    describe: "Disable tips.",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "tips";
export const description = "Show tips while using Graphite";
export const canonical = "user tips";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    if (argv.enable) {
      userConfig.toggleTips(true);
      logInfo(`tips enabled`);
    } else if (argv.disable) {
      userConfig.toggleTips(false);
      logInfo(`tips disabled`);
    } else {
      userConfig.tipsEnabled()
        ? logInfo(`tips enabled`)
        : logInfo(`tips disabled`);
    }
  });
};
