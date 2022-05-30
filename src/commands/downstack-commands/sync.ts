import yargs from 'yargs';
import { syncAction } from '../../actions/sync/sync';
import { getDownstackDependencies } from '../../lib/api/get_downstack_dependencies';
import { ExitFailedError } from '../../lib/errors';
import { cliAuthPrecondition } from '../../lib/preconditions';
import { profile } from '../../lib/telemetry/profile';

const args = {
  branch: {
    describe: `Branch to sync from`,
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
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (!argv.branch) {
      // TODO implement a picker that allows selection of legal remote branches (open PRs)
      throw new ExitFailedError('Remote branch picker not yet implemented');
    }

    const authToken = cliAuthPrecondition(context);

    const downstackToSync = await getDownstackDependencies(
      { branchName: argv.branch, trunkName: context.metaCache.trunk },
      {
        authToken,
        repoName: context.repoConfig.getRepoName(),
        repoOwner: context.repoConfig.getRepoOwner(),
      }
    );

    context.splog.logDebug(
      `Downstack branch list:\n${downstackToSync.join('\n')}\n`
    );

    await syncAction(
      {
        pull: true,
        delete: false,
        showDeleteProgress: false,
        force: false,
        downstackToSync,
      },
      context
    );
  });
};
