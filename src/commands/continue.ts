import chalk from 'chalk';
import yargs from 'yargs';
import { restackBranches } from '../actions/restack';
import { clearContinueConfig } from '../lib/config/continue_config';
import { PreconditionsFailedError, RebaseConflictError } from '../lib/errors';
import { addAll } from '../lib/git/add_all';
import { rebaseInProgress } from '../lib/git/rebase_in_progress';
import { profile } from '../lib/telemetry/profile';

const args = {
  all: {
    describe: `Stage all changes before continuing.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'a',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'continue';
export const canonical = 'continue';
export const aliases = [];
export const description =
  'Continues the most-recent Graphite command halted by a merge conflict.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) => {
    if (!rebaseInProgress()) {
      clearContinueConfig(context);
      throw new PreconditionsFailedError(`No Graphite command to continue.`);
    }

    if (argv.all) {
      addAll();
    }

    const cont = context.metaCache.continueRebase();
    if (cont.result === 'REBASE_CONFLICT') {
      throw new RebaseConflictError(`Rebase conflict is not yet resolved.`);
    }

    context.splog.logInfo(
      `Resolved rebase conflict for ${chalk.green(cont.branchName)}.`
    );

    const branchesToRestack = context.continueConfig.data?.branchesToRestack;

    if (branchesToRestack) {
      restackBranches(
        { relative: false, branchNames: branchesToRestack },
        context
      );
    }
    clearContinueConfig(context);
  });
