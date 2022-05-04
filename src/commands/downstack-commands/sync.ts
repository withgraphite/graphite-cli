import chalk from 'chalk';
import yargs from 'yargs';
import { syncAction } from '../../actions/sync/sync';
import { ExitFailedError } from '../../lib/errors';
import { profile } from '../../lib/telemetry';

const args = {
  branch: {
    describe: `Optional branch to sync from`,
    demandOption: false,
    type: 'string',
    positional: true,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'sync [branch]';
export const canonical = 'downstack sync';
export const description = 'Sync a branch and its downstack from remote.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (!context.userConfig.data.multiplayerEnabled) {
      throw new ExitFailedError(
        `The experimental multiplayer features are disabled in your user config. To enable, set the following property in ${chalk.yellow(
          '$HOME/.graphite_user_config'
        )}:\n\n\t"multiplayerEnabled": true\n\nNOTE: a trailing comma will break our fragile JSON parser.`
      );
    }

    if (!argv.branch) {
      throw new ExitFailedError('Remote branch picker not yet implemented');
    }

    await syncAction(
      {
        pull: true,
        force: false,
        resubmit: false, // TODO(jacob) implement
        delete: false,
        showDeleteProgress: false, // TODO(jacob) implement
        fixDanglingBranches: false, // TODO(jacob) implement
        pruneRemoteMetadata: true,
      },
      { type: 'DOWNSTACK', branchName: argv.branch },
      context
    );
  });
};
