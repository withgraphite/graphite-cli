import yargs from 'yargs';
import { graphite } from '../../lib/runner';

const args = {
  set: {
    optional: true,
    type: 'number',
    alias: 's',
    describe:
      'Override the max age of branches (behind trunk) Graphite will track.',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'max-days-behind-trunk';
export const canonical = 'repo max-days-behind-trunk';
export const description =
  'Graphite will track branches that lag up to this many days behind trunk. e.g. If this is set to 90, Graphite log/Graphite stacks commands will show all stacks up to 90 days behind trunk.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    if (argv.set) {
      context.repoConfig.update(
        (data) => (data.maxDaysShownBehindTrunk = argv.set)
      );
    } else {
      context.splog.logInfo(
        context.repoConfig.getMaxDaysShownBehindTrunk().toString()
      );
    }
  });
};
