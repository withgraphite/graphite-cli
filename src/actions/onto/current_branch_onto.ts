import { MergeConflictCallstackT } from '../../lib/config/merge_conflict_callstack_config';
import { PreconditionsFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { checkoutBranch, trackedUncommittedChanges } from '../../lib/utils';
import { stackOnto } from './stack_onto';

export async function currentBranchOntoAction(args: {
  onto: string;
  mergeConflictCallstack: MergeConflictCallstackT;
}): Promise<void> {
  if (trackedUncommittedChanges()) {
    throw new PreconditionsFailedError('Cannot fix with uncommitted changes');
  }

  const originalBranch = currentBranchPrecondition();

  await stackOnto({
    currentBranch: originalBranch,
    onto: args.onto,
    mergeConflictCallstack: args.mergeConflictCallstack,
  });

  checkoutBranch(originalBranch.name);
}
