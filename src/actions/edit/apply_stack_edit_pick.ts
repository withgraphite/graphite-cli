import { TContext } from '../../lib/context/context';
import { checkoutBranch } from '../../lib/utils';
import { Branch } from '../../wrapper-classes/branch';
import { stackOnto } from '../onto/stack_onto';
import { TStackEdit, TStackEditPick } from './stack_edits';

export function applyStackEditPick(
  stackEdit: TStackEditPick,
  remainingEdits: TStackEdit[],
  context: TContext
): void {
  checkoutBranch(stackEdit.branchName, { quiet: true });
  stackOnto(
    {
      currentBranch: new Branch(stackEdit.branchName),
      onto: stackEdit.onto,
      mergeConflictCallstack: [
        {
          op: 'STACK_EDIT_CONTINUATION',
          currentBranchName: stackEdit.branchName,
          remainingEdits: remainingEdits,
        },
      ],
    },
    context
  );
}
