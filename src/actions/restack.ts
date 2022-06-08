import chalk from 'chalk';
import { TContext } from '../lib/context';
import { PreconditionsFailedError, RebaseConflictError } from '../lib/errors';
import { addAll } from '../lib/git/add_all';
import { rebaseInProgress } from '../lib/git/rebase_in_progress';
import { assertUnreachable } from '../lib/utils/assert_unreachable';
import { clearContinuation, persistContinuation } from './persist_continuation';

export function restackBranches(
  branchNames: string[],
  context: TContext
): void {
  context.splog.logDebug(
    branchNames.reduce((acc, curr) => `${acc}\n${curr}`, 'RESTACKING:')
  );
  while (branchNames.length > 0) {
    const branchName = branchNames.shift() as string;

    if (context.metaCache.isTrunk(branchName)) {
      context.splog.logInfo(
        `${chalk.cyan(branchName)} does not need to be restacked.`
      );
      continue;
    }

    const result = context.metaCache.restackBranch(branchName);
    context.splog.logDebug(`${result}: ${branchName}`);
    switch (result) {
      case 'REBASE_DONE':
        context.splog.logInfo(
          `Restacked ${chalk.green(branchName)} on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}.`
        );
        continue;

      case 'REBASE_CONFLICT':
        persistContinuation({ branchesToRestack: branchNames }, context);
        throw new RebaseConflictError(
          `Hit conflict restacking ${chalk.yellow(branchName)} on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}.`
        );

      case 'REBASE_UNNEEDED':
        context.splog.logInfo(
          `${chalk.cyan(
            branchName
          )} does not need to be restacked${` on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}`}.`
        );
        continue;

      default:
        assertUnreachable(result);
    }
  }
}

export function continueRestack(
  opts: { addAll: boolean },
  context: TContext
): void {
  if (!rebaseInProgress()) {
    clearContinuation(context);
    throw new PreconditionsFailedError(`No Graphite command to continue.`);
  }

  if (opts.addAll) {
    addAll();
  }
  const branchesToRestack = context.continueConfig.data?.branchesToRestack;

  const cont = context.metaCache.continueRebase();
  if (cont.result === 'REBASE_CONFLICT') {
    persistContinuation({ branchesToRestack: branchesToRestack }, context);
    throw new RebaseConflictError(`Rebase conflict is not yet resolved.`);
  }

  context.splog.logInfo(
    `Resolved rebase conflict for ${chalk.green(cont.branchName)}.`
  );

  if (branchesToRestack) {
    restackBranches(branchesToRestack, context);
  }
  clearContinuation(context);
}
