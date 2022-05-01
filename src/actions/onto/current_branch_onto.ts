import { TMergeConflictCallstack } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
import {
  currentBranchPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../../lib/preconditions';
import { checkoutBranch } from '../../lib/utils';
import { stackOnto } from './stack_onto';

export async function currentBranchOntoAction(
  args: {
    onto: string;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): Promise<void> {
  uncommittedTrackedChangesPrecondition();

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
