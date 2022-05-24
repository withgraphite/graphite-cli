import yargs from 'yargs';
import { restackCurrentUpstack } from '../../actions/restack';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['r'];
export const command = 'restack';
export const canonical = 'upstack restack';
export const description =
  'Restack the branch onto its parent, and then do the same for its recursive children.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) =>
    restackCurrentUpstack(context)
  );
};
