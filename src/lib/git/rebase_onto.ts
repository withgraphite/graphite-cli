import { Branch } from '../../wrapper-classes/branch';
import { cache } from '../config/cache';
import { TMergeConflictCallstack } from '../config/merge_conflict_callstack_config';
import { TContext } from '../context';
import { ExitFailedError, RebaseConflictError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';
import { logDebug } from '../utils/splog';
import { rebaseInProgress } from './rebase_in_progress';

// TODO migrate mergeBase to use parentRevision of the current branch
export function rebaseOnto(
  args: {
    onto: Branch;
    mergeBase: string;
    branch: Branch;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): boolean {
  if (args.mergeBase === args.onto.getCurrentRef()) {
    logDebug(
      `No rebase needed for (${args.branch.name}) onto (${args.onto.name}).`
    );
    return false;
  }

  // TODO can kill this once we are fully migrated to parentRevision
  // Save the old ref from before rebasing so that children can find their bases.
  args.branch.savePrevRef();
  gpExecSync(
    {
      command: `git rebase --onto ${args.onto.name} ${args.mergeBase} ${args.branch.name}`,
      options: { stdio: 'ignore' },
    },
    (err) => {
      if (rebaseInProgress()) {
        throw new RebaseConflictError(
          `Interactive rebase in progress, cannot fix (${args.branch.name}) onto (${args.onto.name}).`,
          args.mergeConflictCallstack,
          context
        );
      } else {
        throw new ExitFailedError(
          `Rebase failed when moving (${args.branch.name}) onto (${args.onto.name}).`,
          err
        );
      }
    }
  );
  cache.clearAll();
  return true;
}
