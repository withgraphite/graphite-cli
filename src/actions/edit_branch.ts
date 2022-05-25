import chalk from 'chalk';
import { persistBranchesToRestack } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import { RebaseConflictError } from '../lib/errors';
import { restackCurrentUpstackExclusive } from './restack';

export function editBranchAction(context: TContext): void {
  const currentBranchName = context.metaCache.currentBranchPrecondition;
  if (
    context.metaCache.rebaseInteractive(currentBranchName) === 'REBASE_CONFLICT'
  ) {
    const branchNames = context.metaCache.getRecursiveChildren(
      context.metaCache.currentBranchPrecondition
    );
    persistBranchesToRestack(branchNames, context);
    throw new RebaseConflictError(
      `Hit conflict during interactive rebase of ${chalk.yellow(
        currentBranchName
      )}.`
    );
  }

  restackCurrentUpstackExclusive(context);
}
