import { TContext } from '../../lib/context';
import { switchBranch } from '../../lib/git/checkout_branch';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { currentBranchOnto } from '../current_branch_onto';

export function applyStackEditPick(
  opts: { branchName: string; remainingBranchNames: string[] },
  context: TContext
): void {
  const onto = currentBranchPrecondition().name;
  switchBranch(opts.branchName);
  currentBranchOnto(onto, context);
}
