import { TMergeConflictCallstack } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
import { PreconditionsFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { checkoutBranch, trackedUncommittedChanges } from '../../lib/utils';
import { stackOnto } from './stack_onto';

export async function currentBranchOntoAction(
  args: {
    onto: string;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): Promise<void> {
  if (trackedUncommittedChanges()) {
    throw new PreconditionsFailedError('Cannot fix with uncommitted changes');
  }

  const originalBranch = currentBranchPrecondition(context);

  await stackOnto(
    {
      currentBranch: originalBranch,
      onto: args.onto,
      mergeConflictCallstack: args.mergeConflictCallstack,
    },
    context
  );

  checkoutBranch(originalBranch.name, { quiet: true });
}
