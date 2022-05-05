import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';
import { logInfo } from '../../lib/utils/splog';

const args = {
  enable: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe: 'Enable tips.',
  },
  disable: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe: 'Disable tips.',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'tips';
export const description = 'Show tips while using Graphite';
export const canonical = 'user tips';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv.enable) {
      context.userConfig.update((data) => (data.tips = true));
      logInfo(`tips enabled`);
    } else if (argv.disable) {
      context.userConfig.update((data) => (data.tips = false));
      logInfo(`tips disabled`);
    } else {
      context.userConfig.data.tips
        ? logInfo(`tips enabled`)
        : logInfo(`tips disabled`);
    }
  });
};
