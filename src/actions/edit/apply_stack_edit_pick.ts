import { TContext } from '../../lib/context/context';
import { checkoutBranch } from '../../lib/utils';
import { Branch } from '../../wrapper-classes/branch';
import { stackOnto } from '../onto/stack_onto';
import { TStackEdit, TStackEditPick } from './stack_edits';

export async function applyStackEditPick(
  stackEdit: TStackEditPick,
  remainingEdits: TStackEdit[],
  context: TContext
): Promise<void> {
  checkoutBranch(stackEdit.branchName);
  await stackOnto(
    {
      currentBranch: new Branch(stackEdit.branchName),
      onto: stackEdit.onto,
      mergeConflictCallstack: [
        {
          op: 'STACK_EDIT_CONTINUATION',
          currentBranchName: stackEdit.branchName,
          remainingEdits: remainingEdits,
        },
        'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER',
      ],
    },
    context
  );
}
