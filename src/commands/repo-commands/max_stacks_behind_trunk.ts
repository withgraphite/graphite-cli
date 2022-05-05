import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';
import { logInfo } from '../../lib/utils/splog';

const args = {
  set: {
    optional: true,
    type: 'number',
    alias: 's',
    describe:
      'Override the max number of stacks (behind trunk) Graphite will track.',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'max-stacks-behind-trunk';
export const canonical = 'repo max-stacks-behind-trunk';
export const description =
  'Graphite will track up to this many stacks that lag behind trunk. e.g. If this is set to 5, Graphite log/Graphite stacks commands will only show the first 5 stacks behind trunk.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv.set) {
      context.repoConfig.update(
        (data) => (data.maxStacksShownBehindTrunk = argv.set)
      );
    } else {
      logInfo(context.repoConfig.getMaxStacksShownBehindTrunk().toString());
    }
  });
};
