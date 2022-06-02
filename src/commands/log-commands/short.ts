import yargs from 'yargs';
import { logShortClassic } from '../../actions/display_branches';
import { logAction } from '../../actions/log';
import { profile } from '../../lib/telemetry/profile';

const args = {
  classic: {
    type: 'boolean',
    default: false,
    alias: 'c',
    describe: 'Use the old logging style.',
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
    argv.classic ? logShortClassic(context) : logAction('SHORT', context)
  );
