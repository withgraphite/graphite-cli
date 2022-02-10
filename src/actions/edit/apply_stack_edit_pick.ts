import { checkoutBranch } from '../../lib/utils';
import Branch from '../../wrapper-classes/branch';
import { stackOnto } from '../onto/stack_onto';
import { TStackEditStackFrame } from './../../lib/config/merge_conflict_callstack_config';
import { TStackEdit, TStackEditPick } from './stack_edits';

export async function applyStackEditPick(
  stackEdit: TStackEditPick,
  remainingEdits: TStackEdit[]
): Promise<void> {
  checkoutBranch(stackEdit.branchName);
  await stackOnto({
    currentBranch: new Branch(stackEdit.branchName),
    onto: stackEdit.onto,
    mergeConflictCallstack: {
      parent: 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER',
      frame: {
        op: 'STACK_EDIT_CONTINUATION',
        currentBranch: stackEdit.branchName,
        remainingEdits: remainingEdits,
      } as TStackEditStackFrame,
    },
  });
}
