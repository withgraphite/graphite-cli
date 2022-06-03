import chalk from 'chalk';
import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { RebaseConflictError } from '../lib/errors';
import { persistContinuation } from './persist_continuation';
import { restackBranches } from './restack';

export function editBranchAction(context: TContext): void {
  const currentBranchName = context.metaCache.currentBranchPrecondition;
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
    throw new RebaseConflictError(
      `Hit conflict during interactive rebase of ${chalk.yellow(
        currentBranchName
      )}.`
    );
  }

  restackBranches({ relative: true, scope: SCOPE.UPSTACK_EXCLUSIVE }, context);
}
