import chalk from 'chalk';
import { TContext } from '../lib/context';
import {
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
} from '../lib/errors';
import { addAll } from '../lib/git/add_all';
import { rebaseInProgress } from '../lib/git/rebase_in_progress';
import { assertUnreachable } from '../lib/utils/assert_unreachable';
import { clearContinuation, persistContinuation } from './persist_continuation';
import { printConflictStatus } from './print_conflict_status';

export function restackBranches(
  branchNames: string[],
  context: TContext
): void {
  context.splog.debug(
    branchNames.reduce((acc, curr) => `${acc}\n${curr}`, 'RESTACKING:')
  );
  while (branchNames.length > 0) {
    const branchName = branchNames.shift() as string;

    if (context.metaCache.isTrunk(branchName)) {
      context.splog.info(
        `${chalk.cyan(branchName)} does not need to be restacked.`
      );
      continue;
    }

    const result = context.metaCache.restackBranch(branchName);
    context.splog.debug(`${result}: ${branchName}`);
    switch (result.result) {
      case 'REBASE_DONE':
        context.splog.info(
          `Restacked ${chalk.green(branchName)} on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}.`
        );
        continue;

      case 'REBASE_CONFLICT':
        persistContinuation(
          {
            branchesToRestack: branchNames,
            rebasedBranchBase: result.rebasedBranchBase,
          },
          context
        );
        printConflictStatus(
          `Hit conflict restacking ${chalk.yellow(branchName)} on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}.`,
          context
        );
        throw new RebaseConflictError();

      case 'REBASE_UNNEEDED':
        context.splog.info(
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
  const rebasedBranchBase = context.continueConfig.data.rebasedBranchBase;
  if (!rebasedBranchBase) {
    clearContinuation(context);
    throw new ExitFailedError('Invalid continue state, cancelling.');
  }

  const cont = context.metaCache.continueRebase(rebasedBranchBase);
  if (cont.result === 'REBASE_CONFLICT') {
    persistContinuation(
      { branchesToRestack: branchesToRestack, rebasedBranchBase },
      context
    );
    printConflictStatus(`Rebase conflict is not yet resolved.`, context);
    throw new RebaseConflictError();
  }

  context.splog.info(
    `Resolved rebase conflict for ${chalk.green(cont.branchName)}.`
  );

  if (branchesToRestack) {
    restackBranches(branchesToRestack, context);
  }
  clearContinuation(context);
}
