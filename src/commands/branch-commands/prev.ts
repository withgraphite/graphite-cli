import yargs from "yargs";
import { nextOrPrevAction } from "../../actions/next_or_prev";
import { globalArgs } from "../../lib/global-arguments";
import { profile } from "../../lib/telemetry";

const args = {
  steps: {
    describe: `The number of levels to traverse downstack.`,
    demandOption: false,
    default: 1,
    type: "number",
    alias: "n",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "prev [steps]";
export const aliases = ["p"];
export const description =
  "If you're in a stack: Branch A → Branch B (you are here) → Branch C, checkout the branch directly downstack (Branch A). If there are multiple parent branches in the stack, `gt prev` will prompt you to choose which branch to checkout.  Pass the `steps` arg to checkout the branch `[steps]` levels below in the stack.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await nextOrPrevAction({
      nextOrPrev: "prev",
      numSteps: argv.steps,
      interactive: globalArgs.interactive,
    });
  });
};
