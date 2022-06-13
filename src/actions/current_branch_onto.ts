import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { uncommittedTrackedChangesPrecondition } from '../lib/preconditions';
import { restackBranches } from './restack';

export function currentBranchOnto(
  ontoBranchName: string,
  context: TContext
): void {
  uncommittedTrackedChangesPrecondition();

  const currentBranch = context.metaCache.currentBranchPrecondition;

  context.metaCache.setParent(currentBranch, ontoBranchName);

  restackBranches(
    context.metaCache.getRelativeStack(currentBranch, SCOPE.UPSTACK),
    context
  );
}
