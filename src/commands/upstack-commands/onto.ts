import yargs from "yargs";
import { ontoAction } from "../../actions/onto";
import { profile } from "../../lib/telemetry";

const args = {
  branch: {
    describe: `A branch to rebase the current stack onto`,
    demandOption: true,
    optional: false,
    positional: true,
    type: "string",
  },
} as const;

export const command = "onto <branch>";
export const description =
  "Rebase any upstack branches onto the latest commit (HEAD) of the current branch.";
export const builder = args;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    await ontoAction(argv.branch);
  });
};
