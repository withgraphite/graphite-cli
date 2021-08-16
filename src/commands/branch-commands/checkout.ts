import yargs from "yargs";
import { stacksAction } from "../../actions/stacks";
import { profile } from "../../lib/telemetry";
import { gpExecSync } from "../../lib/utils";

const args = {
  branch: {
    describe: `Optional branch to checkout`,
    demandOption: false,
    type: "string",
    positional: true,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "checkout [branch]";
export const description = "Checkout a branch in a stack";
export const aliases = ["co"];
export const builder = args;

export const handler = async (args: argsT): Promise<void> => {
  return profile(args, async () => {
    if (args.branch) {
      gpExecSync({ command: `git checkout ${args.branch}` });
    } else {
      await stacksAction({ all: false, interactive: true });
    }
  });
};
