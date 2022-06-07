import { TContext } from '../../lib/context';
import { uncommittedTrackedChangesPrecondition } from '../../lib/preconditions';
import { restackCurrentUpstack } from '../restack';

export function currentBranchOnto(
  ontoBranchName: string,
  context: TContext
): void {
  uncommittedTrackedChangesPrecondition();

  context.metaCache.setParent(
    context.metaCache.currentBranchPrecondition,
    ontoBranchName
  );
  restackCurrentUpstack(context);
}
