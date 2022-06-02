import yargs from 'yargs';
import { logAction } from '../../actions/log';
import { profile } from '../../lib/telemetry/profile';

const args = {
  reverse: {
    describe: `Print the log upside down. Handy when you have a lot of branches!`,
    type: 'boolean',
    alias: 'r',
    default: false,
  },
} as const;

export const command = '*';
export const description = 'Log all stacks tracked by Graphite.';
export const builder = args;
export const canonical = 'log';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) =>
    logAction({ style: 'FULL', reverse: argv.reverse }, context)
  );
