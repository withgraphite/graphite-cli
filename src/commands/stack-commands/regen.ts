import yargs from "yargs";
import { regenAction } from "../../actions/regen";
import { profile } from "../../lib/telemetry";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "regen";
export const description =
  "Recreate the current stack by tracing git branches from trunk through to leave branches.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await regenAction(argv.silent);
  });
};
