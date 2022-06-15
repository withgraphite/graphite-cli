import chalk from 'chalk';
import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { RebaseConflictError } from '../lib/errors';
import { persistContinuation } from './persist_continuation';
import { printConflictStatus } from './print_conflict_status';
import { restackBranches } from './restack';

export function editBranchAction(context: TContext): void {
  const currentBranchName = context.metaCache.currentBranchPrecondition;

  const result = context.metaCache.rebaseInteractive(currentBranchName);

  if (result.result === 'REBASE_CONFLICT') {
    persistContinuation(
      {
        branchesToRestack: context.metaCache.getRelativeStack(
          currentBranchName,
          SCOPE.UPSTACK_EXCLUSIVE
        ),
        rebasedBranchBase: result.rebasedBranchBase,
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
