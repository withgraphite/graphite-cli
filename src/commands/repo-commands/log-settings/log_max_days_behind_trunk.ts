import yargs from "yargs";
import { repoConfig } from "../../../lib/config";
import { profile } from "../../../lib/telemetry";
import { logInfo } from "../../../lib/utils";

const args = {
  set: {
    demandOption: false,
    default: false,
    type: "number",
    alias: "s",
    describe:
      "Override the max age of branches (behind trunk) Graphite log will show.",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "max-days-behind-trunk";
export const description =
  "Graphite will display branches that lag up to this many days behind trunk. e.g. If this is set to 90, Graphite log will show all stacks up to 90 days behind trunk.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    if (argv.set) {
      repoConfig.setMaxDaysShownBehindTrunk(argv.set);
    } else {
      logInfo(repoConfig.getMaxDaysShownBehindTrunk().toString());
    }
  });
};
