import chalk from 'chalk';
import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { ExitFailedError, RebaseConflictError } from '../lib/errors';
import { persistContinuation } from './persist_continuation';
import { printConflictStatus } from './print_conflict_status';
import { restackBranches } from './restack';

export function editBranchAction(context: TContext): void {
  const currentBranchName = context.metaCache.currentBranchPrecondition;
  // TODO fix the bug that breaks interactive rebase on non-restacked branches
  // (bug is that restack continue sets parent revision to the wrong thing; the
  // solution will be persisting new parent revision in continuation which also
  // fixes ds sync rebasing)
  if (!context.metaCache.isBranchFixed(currentBranchName)) {
    throw new ExitFailedError(
      'Can only edit restacked branches in this version, will be fixed soon!'
    );
  }

  if (
    context.metaCache.rebaseInteractive(currentBranchName) === 'REBASE_CONFLICT'
  ) {
    persistContinuation(
      {
        branchesToRestack: context.metaCache.getRelativeStack(
          currentBranchName,
          SCOPE.UPSTACK_EXCLUSIVE
        ),
      },
      context
    );
    printConflictStatus(
      `Hit conflict during interactive rebase of ${chalk.yellow(
        currentBranchName
      )}.`,
      context
    );
    throw new RebaseConflictError();
  }

  restackBranches(
    context.metaCache.getRelativeStack(
      context.metaCache.currentBranchPrecondition,
      SCOPE.UPSTACK_EXCLUSIVE
    ),
    context
  );
}
