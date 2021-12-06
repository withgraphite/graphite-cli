import yargs from 'yargs';
import { repoConfig } from '../../lib/config';
import { profile } from '../../lib/telemetry';
import { logInfo } from '../../lib/utils';

const args = {
  add: {
    demandOption: false,
    default: false,
    type: 'string',
    describe: 'Add a branch to be ignored by Graphite.',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'ignored-branches';
export const canonical = 'repo ignore-branches';
export const description =
  'Specify branches for Graphite to ignore. Often branches that you never plan to create PRs and merge into trunk.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    if (argv.add) {
      // if (!Branch.exists(argv.add)) {
      //   throw new PreconditionsFailedError(`Branch (${argv.add}) not found`);
      // }
      // TODO: Refactor setIgnoreBranches to do this implicitly
      repoConfig.setIgnoreBranches([argv.add]);
      logInfo(`Added (${argv.add}) to be ignored`);
    } else {
      // TODO: Why are we printing all the ignored branches?
      logInfo(repoConfig.getIgnoreBranches().join('\n'));
    }
  });
};
