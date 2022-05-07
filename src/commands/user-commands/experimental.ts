import yargs from 'yargs';
import { profile } from '../../lib/telemetry';
import { logInfo } from '../../lib/utils/splog';

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
  return profile(argv, canonical, async (context) => {
    if (argv.enable) {
      context.userConfig.update((data) => (data.experimental = true));
      logInfo(`experimental features enabled`);
    } else if (argv.disable) {
      context.userConfig.update((data) => (data.experimental = false));
      logInfo(`experimental features disabled`);
    } else {
      context.userConfig.data.experimental
        ? logInfo(`experimental features enabled`)
        : logInfo(`experimental features disabled`);
    }
  });
};
