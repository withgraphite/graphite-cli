import chalk from 'chalk';
import yargs from 'yargs';
import { getDownstackDependencies } from '../../actions/sync/get_downstack_dependencies';
import { ExitFailedError } from '../../lib/errors';
import { profile } from '../../lib/telemetry/profile';
import { logDebug } from '../../lib/utils/splog';

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
export const description = 'Sync a branch and its downstack from remote.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (!context.userConfig.data.experimental) {
      throw new ExitFailedError(
        `Experimental features are disabled in your user config. To enable, run:\n\n${chalk.yellow(
          'gt user experimental --enable'
        )}`
      );
    }

    if (!argv.branch) {
      // TODO implement a picker that allows selection of legal remote branches (open PRs)
      throw new ExitFailedError('Remote branch picker not yet implemented');
    }

    const downstackDependencies = await getDownstackDependencies(
      argv.branch,
      context
    );

    logDebug(`Downstack branch list: ${downstackDependencies}`);
    throw new ExitFailedError('Downstack sync not yet implemented');
  });
};
