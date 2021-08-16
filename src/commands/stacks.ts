import yargs from "yargs";
import { stacksAction } from "../actions/stacks";
import { profile } from "../lib/telemetry";

const args = {
  all: {
    describe: `Show all branches.`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "a",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "stacks";
export const description = "Print stacks.";
export const builder = args;

export const handler = async (args: argsT): Promise<void> => {
  return profile(args, async () => {
    await stacksAction({ all: args.all, interactive: false });
  });
};
