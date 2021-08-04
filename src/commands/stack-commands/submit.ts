import yargs from "yargs";
import { submitAction } from "../../actions/submit";
import { profile } from "../../lib/telemetry";

export const command = "submit";
export const description =
  "Experimental: Idempotently force pushes all branches in stack and creates/updates PR's for each.";

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, async () => {
    await submitAction("FULLSTACK", {});
  });
};
