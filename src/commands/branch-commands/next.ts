import yargs from "yargs";
import { nextOrPrevAction } from "../../actions/next_or_prev";
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

export const command = "next";
export const aliases = ["n"];
export const description =
  "If you're in a stack: Branch A → Branch B (you are here) → Branch C. Takes you to the next branch (Branch C). If there are two descendent branches, errors out and tells you the various branches you could go to.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await nextOrPrevAction("next", argv.silent);
  });
};
