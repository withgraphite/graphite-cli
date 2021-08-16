import yargs from "yargs";
import { stacksAction } from "../../actions/stacks";
import { profile } from "../../lib/telemetry";

const args = {} as const;

export const command = "short";
export const description = "Log all stacks tracked by Graphite.";
export const builder = args;
export const aliases = ["s"];

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
<<<<<<< HEAD
    await stacksAction({ all: false, interactive: false });
=======
    await stacksAction(false, false);
>>>>>>> 866e1b5 (refactor(log): move to noun verb pattern)
  });
};
