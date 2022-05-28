import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';

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
      context.splog.logInfo(`tips enabled`);
    } else if (argv.disable) {
      context.userConfig.update((data) => (data.tips = false));
      context.splog.logInfo(`tips disabled`);
    } else {
      context.userConfig.data.tips
        ? context.splog.logInfo(`tips enabled`)
        : context.splog.logInfo(`tips disabled`);
    }
  });
};
