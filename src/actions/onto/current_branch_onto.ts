import { TMergeConflictCallstack } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context';
import { checkoutBranch } from '../../lib/git/checkout_branch';
import {
  currentBranchPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../../lib/preconditions';
import { stackOnto } from './stack_onto';

export function currentBranchOntoAction(
  args: {
    onto: string;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): void {
  uncommittedTrackedChangesPrecondition();

  const originalBranch = currentBranchPrecondition();

  stackOnto(
    {
      currentBranch: originalBranch,
      onto: args.onto,
      mergeConflictCallstack: args.mergeConflictCallstack,
    },
    context
  );

  checkoutBranch(originalBranch.name);
}
