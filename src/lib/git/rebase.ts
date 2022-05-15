import { Branch } from '../../wrapper-classes/branch';
import { cache } from '../config/cache';
import { TMergeConflictCallstack } from '../config/merge_conflict_callstack_config';
import { TContext } from '../context';
import { ExitFailedError, RebaseConflictError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';
import { logDebug } from '../utils/splog';
import { getBranchRevision } from './get_branch_revision';
import { rebaseInProgress } from './rebase_in_progress';

// TODO migrate mergeBase to use parentRevision of the current branch
export function rebaseOnto(
  args: {
    ontoBranchName: string;
    mergeBase: string;
    branch: Branch;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): boolean {
  if (args.mergeBase === getBranchRevision(args.ontoBranchName)) {
    logDebug(
      `No rebase needed for (${args.branch.name}) onto (${args.ontoBranchName}).`
    );
    return false;
  }

  // TODO can kill this once we are fully migrated to parentRevision
  // Save the old ref from before rebasing so that children can find their bases.
  args.branch.savePrevRef();
  gpExecSync(
    {
      command: `git rebase --onto ${args.ontoBranchName} ${args.mergeBase} ${args.branch.name}`,
      options: { stdio: 'ignore' },
    },
    (err) => {
      if (rebaseInProgress()) {
        throw new RebaseConflictError(
          `Interactive rebase in progress, cannot fix (${args.branch.name}) onto (${args.ontoBranchName}).`,
          args.mergeConflictCallstack,
          context
        );
      } else {
        throw new ExitFailedError(
          `Rebase failed when moving (${args.branch.name}) onto (${args.ontoBranchName}).`,
          err
        );
      }
    }
  );
  cache.clearAll();
  return true;
}

export function rebaseInteractive(
  args: {
    base: string;
    currentBranchName: string;
  },
  context: TContext
): void {
  gpExecSync(
    {
      command: `git rebase -i ${args.base}`,
      options: { stdio: 'inherit' },
    },
    (err) => {
      if (rebaseInProgress()) {
        throw new RebaseConflictError(
          `Interactive rebase in progress.  After resolving merge conflicts, run 'gt continue'`,
          [
            {
              op: 'STACK_FIX' as const,
              sourceBranchName: args.currentBranchName,
            },
          ],
          context
        );
      } else {
        throw new ExitFailedError(`Interactive rebase failed.`, err);
      }
    }
  );
}
