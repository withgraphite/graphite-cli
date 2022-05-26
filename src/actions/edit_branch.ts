import chalk from 'chalk';
import { persistBranchesToRestack } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import { RebaseConflictError } from '../lib/errors';
import { SCOPE } from '../lib/state/scope_spec';
import { restackBranches } from './restack';

export function editBranchAction(context: TContext): void {
  const currentBranchName = context.metaCache.currentBranchPrecondition;
  if (
    context.metaCache.rebaseInteractive(currentBranchName) === 'REBASE_CONFLICT'
  ) {
    persistBranchesToRestack(
      context.metaCache.getCurrentStack(SCOPE.UPSTACK_EXCLUSIVE),
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
