import { checkoutBranch } from '../../lib/utils';
import Branch from '../../wrapper-classes/branch';
import { stackOnto } from '../onto/stack_onto';
import { TStackEditPick } from './stack_edits';

export async function applyStackEditPick(
  stackEdit: TStackEditPick
): Promise<void> {
  checkoutBranch(stackEdit.branchName);
  await stackOnto({
    currentBranch: new Branch(stackEdit.branchName),
    onto: stackEdit.onto,
    mergeConflictCallstack: 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER',
  });
}
