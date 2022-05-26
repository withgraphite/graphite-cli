import { TContext } from '../../lib/context';
import { uncommittedTrackedChangesPrecondition } from '../../lib/preconditions';
import { SCOPE } from '../../lib/state/scope_spec';
import { restackBranches } from '../restack';

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
