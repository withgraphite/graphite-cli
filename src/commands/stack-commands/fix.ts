import yargs from "yargs";
import { fixAction } from "../../actions/fix";
import { profile } from "../../lib/telemetry";

export const command = "fix";
export const description =
  "Rebase any upstack branches onto the latest commit (HEAD) of the current branch.";

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
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await fixAction(argv.silent);
  });
};
