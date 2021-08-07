import yargs from "yargs";
import { nextOrPrevAction } from "../../actions/next_or_prev";
import { profile } from "../../lib/telemetry";

const args = {
  steps: {
    describe: `number of branches to traverse`,
    demandOption: false,
    default: 1,
    type: "number",
    alias: "n",
  },
  interactive: {
    describe: `Enable interactive branch picking when necessary`,
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
  "If you're in a stack: Branch A → Branch B (you are here) → Branch C. Takes you to the next branch (Branch C). If there are two descendent branches, errors out and tells you the various branches you could go to.";
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
