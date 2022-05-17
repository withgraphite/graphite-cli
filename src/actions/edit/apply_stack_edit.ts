import { TContext } from '../../lib/context';
import { RebaseConflictError } from '../../lib/errors';
import { checkoutBranch } from '../../lib/git/checkout_branch';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { currentBranchOntoAction } from '../onto/current_branch_onto';
import { TStackEdit } from './stack_edits';

export function applyStackEditPick(
  opts: { branchName: string; remainingEdits: TStackEdit[] },
  context: TContext
): void {
  const onto = currentBranchPrecondition().name;
  checkoutBranch(opts.branchName);
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

export function applyStackEditExec(
  opts: { command: string; remainingEdits: TStackEdit[] },
  context: TContext
): void {
  const currentBranchName = currentBranchPrecondition().name;
  context.splog.logInfo(`Executing: ${opts.command}`);
  gpExecSync(
    {
      command: opts.command,
      options: { stdio: 'inherit' },
    },
    () => {
      throw new RebaseConflictError(
        `Execution failed: ${opts.command}.  You can fix the problem, and then run: 'gt continue'`,
        [
          {
            op: 'STACK_EDIT_CONTINUATION',
            currentBranchName,
            remainingEdits: opts.remainingEdits,
          },
        ],
        context
      );
    }
  );
}
