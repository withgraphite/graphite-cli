import yargs from "yargs";
import { logShortAction } from "../../actions/log_short";
import { profile } from "../../lib/telemetry";

const args = {} as const;

export const command = "short";
export const description = "Log all stacks tracked by Graphite.";
export const builder = args;
export const aliases = ["s"];
export const canonical = "log short";

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    await logShortAction();
  });
};
