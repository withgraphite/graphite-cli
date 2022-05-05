import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';
import { logInfo } from '../../lib/utils/splog';

const args = {
  set: {
    optional: false,
    type: 'string',
    alias: 's',
    describe:
      "Override the value of the repo owner's name in the Graphite config. This is expected to match the name of the repo owner on GitHub and should only be set in cases where Graphite is incorrectly inferring the repo owner's name.",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'owner';
export const canonical = 'repo owner';
export const description =
  "The current repo owner's name stored in Graphite. e.g. in 'withgraphite/graphite-cli', this is 'withgraphite'.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv.set) {
      context.repoConfig.update((data) => (data.owner = argv.set));
    } else {
      logInfo(context.repoConfig.getRepoOwner());
    }
  });
};
