import yargs from 'yargs';
import { graphite } from '../../lib/runner';

const args = {
  enable: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe: 'Enable experimental features.',
  },
  disable: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe: 'Disable experimental features.',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'experimental';
export const description = 'Enable/disable experimental features';
export const canonical = 'user experimental';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    if (argv.enable) {
      context.userConfig.update((data) => (data.experimental = true));
      context.splog.logInfo(`experimental features enabled`);
    } else if (argv.disable) {
      context.userConfig.update((data) => (data.experimental = false));
      context.splog.logInfo(`experimental features disabled`);
    } else {
      context.userConfig.data.experimental
        ? context.splog.logInfo(`experimental features enabled`)
        : context.splog.logInfo(`experimental features disabled`);
    }
  });
};
