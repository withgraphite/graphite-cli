import yargs from 'yargs';
import { restackCurrentStack } from '../../actions/restack';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['r'];
export const command = 'restack';
export const canonical = 'stack restack';
export const description =
  'Restack each branch of the current stack onto its parent.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) =>
    restackCurrentStack(context)
  );
};
