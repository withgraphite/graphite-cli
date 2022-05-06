import yargs from 'yargs';
import { validate } from '../../actions/validate';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'validate';
export const description =
  "Validate that Graphite's stack metadata for all upstack branches matches the branch relationships stored in git.";
export const builder = args;
export const canonical = 'upstack validate';

export const handler = async (argv: argsT): Promise<void> => {
  return profile(
    argv,
    canonical,
    async (context) => void validate('UPSTACK', context)
  );
};
