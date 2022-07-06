import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { TCommitOpts } from '../lib/git/commit';
import { restackBranches } from './restack';

export function squashCurrentBranch(
  opts: Pick<TCommitOpts, 'message' | 'noEdit'>,
  context: TContext
): void {
  context.metaCache.squashCurrentBranch({
    noEdit: opts.noEdit,
    message: opts.message,
  });
  restackBranches(
    context.metaCache.getRelativeStack(
      context.metaCache.currentBranchPrecondition,
      SCOPE.UPSTACK_EXCLUSIVE
    ),
    context
  );
}
