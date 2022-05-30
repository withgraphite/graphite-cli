import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { uncommittedTrackedChangesPrecondition } from '../lib/preconditions';
import { restackBranches } from './restack';

export function currentBranchOnto(
  ontoBranchName: string,
  context: TContext
): void {
  uncommittedTrackedChangesPrecondition();

  context.metaCache.setParent(
    context.metaCache.currentBranchPrecondition,
    ontoBranchName
  );
  restackBranches({ relative: true, scope: SCOPE.UPSTACK }, context);
}
