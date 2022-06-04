import yargs from 'yargs';
import { logAction } from '../../actions/log';
import { logShortClassic } from '../../actions/log_short_classic';
import { graphite } from '../../lib/runner';

const args = {
  classic: {
    type: 'boolean',
    default: false,
    alias: 'c',
    describe:
      'Use the old logging style, which runs out of screen real estate quicker.',
  },
  reverse: {
    describe: `Print the log upside down. Handy when you have a lot of branches!`,
    type: 'boolean',
    alias: 'r',
    default: false,
  },
} as const;

export const command = 'short';
export const description =
  'Log all stacks tracked by Graphite, arranged to show dependencies.';
export const builder = args;
export const aliases = ['s'];
export const canonical = 'log short';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) =>
    argv.classic
      ? logShortClassic(context)
      : logAction({ style: 'SHORT', reverse: argv.reverse }, context)
  );
