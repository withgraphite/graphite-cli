import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { restackBranches } from './restack';

export function splitCurrentBranch(context: TContext): void {
  context.metaCache.startSplit();
  restackBranches(
    context.metaCache.getRelativeStack(
      context.metaCache.currentBranchPrecondition,
      SCOPE.UPSTACK_EXCLUSIVE
    ),
    context
  );
}
