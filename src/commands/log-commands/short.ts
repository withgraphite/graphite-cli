import yargs from 'yargs';
import { logAction } from '../../actions/log';
import { logShortClassic } from '../../actions/log_short_classic';
import { profile } from '../../lib/telemetry/profile';

const args = {
  classic: {
    type: 'boolean',
    default: false,
    alias: 'c',
    describe: 'Use the old logging style.',
  },
  reverse: {
    describe: `Print the log upside down. Handy when you have a lot of branches!`,
    type: 'boolean',
    alias: 'r',
    default: false,
  },
} as const;

export const command = 'short';
export const description = 'Log all stacks tracked by Graphite.';
export const builder = args;
export const aliases = ['s'];
export const canonical = 'log short';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) =>
    argv.classic
      ? logShortClassic(context)
      : logAction({ style: 'SHORT', reverse: argv.reverse }, context)
  );
