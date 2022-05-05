import yargs from 'yargs';
import { validate } from '../../actions/validate';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'validate';
export const canonical = 'stack validate';
export const description =
  "Validate that Graphite's stack metadata for the current stack matches git's record of branch relationships.";
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    validate('FULLSTACK', context);
  });
};
