import yargs from "yargs";
import { submitAction } from "../../actions/submit";
import { profile } from "../../lib/telemetry";

export const command = "submit";
export const description =
  "Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.";

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, async () => {
    await submitAction("FULLSTACK");
  });
};
