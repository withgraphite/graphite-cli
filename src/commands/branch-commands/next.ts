import yargs from "yargs";
import { nextOrPrevAction } from "../../actions/next_or_prev";
import { profile } from "../../lib/telemetry";

const args = {
  steps: {
    describe: `The number of levels to traverse upstack.`,
    demandOption: false,
    default: 1,
    type: "number",
    alias: "n",
  },
  interactive: {
    describe:
      "Whether or not to show the interactive branch picker (set to false when using `gt next` as part of a shell script).",
    demandOption: false,
    default: true,
    type: "boolean",
    alias: "i",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "next [steps]";
export const aliases = ["n"];
export const description =
  "If you're in a stack, i.e. Branch A → Branch B (you are here) → Branch C, checkout the branch directly upstack (Branch C). If there are multiple child branches above in the stack, `gt next` will prompt you to choose which branch to checkout.  Pass the `steps` arg to checkout the branch `[steps]` levels above in the stack.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await nextOrPrevAction({
      nextOrPrev: "next",
      numSteps: argv.steps,
      interactive: argv.interactive,
    });
  });
};
