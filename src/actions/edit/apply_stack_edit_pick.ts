import { TContext } from '../../lib/context/context';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { checkoutBranch } from '../../lib/utils';
import { currentBranchOntoAction } from '../onto/current_branch_onto';
import { TStackEdit } from './stack_edits';

export function applyStackEditPick(
  opts: { branchName: string; remainingEdits: TStackEdit[] },
  context: TContext
): void {
  const onto = currentBranchPrecondition(context).name;
  checkoutBranch(opts.branchName, { quiet: true });
  currentBranchOntoAction(
    {
      onto: onto,
      mergeConflictCallstack: [
        {
          op: 'STACK_EDIT_CONTINUATION',
          currentBranchName: onto,
          remainingEdits: opts.remainingEdits,
        },
      ],
    },
    context
  );
}
