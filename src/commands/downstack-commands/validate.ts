import yargs from "yargs";
import { validate } from "../../actions/validate";
import { profile } from "../../lib/telemetry";

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "validate";
export const description =
  "Validates that the current downstack matches git's chain of branches.";
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    validate("DOWNSTACK");
  });
};
