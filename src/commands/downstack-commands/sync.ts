import yargs from 'yargs';
import { syncAction } from '../../actions/sync/sync';
import { graphite } from '../../lib/runner';

const args = {
  branch: {
    describe: `Branch to sync from`,
    // TODO implement a picker that allows selection of legal remote branches (open PRs)
    demandOption: true,
    type: 'string',
    positional: true,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'sync [branch]';
export const canonical = 'downstack sync';
export const description =
  'Sync a branch and its recursive parents from remote.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(
    argv,
    canonical,
    async (context) =>
      await syncAction(
        {
          pull: true,
          delete: false,
          showDeleteProgress: false,
          force: false,
          restackCurrentStack: false,
          tipOfDownstack: argv.branch,
        },
        context
      )
  );
