import { TContext } from '../lib/context';
import {
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
} from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { gpExecSync } from '../lib/utils/exec_sync';
import { rebaseInProgress } from '../lib/utils/rebase_in_progress';
import { rebaseUpstack } from './fix';

export async function editBranchAction(context: TContext): Promise<void> {
  const currentBranch = currentBranchPrecondition(context);

  const baseRev = currentBranch.getParentBranchSha();
  if (!baseRev) {
    throw new PreconditionsFailedError(
      `Graphite does not have a base revision for this branch; it might have been created with an older version of Graphite.  Please run a 'fix' or 'validate' command in order to backfill this information.`
    );
  }

  // TODO we will kill this once we cut over to relying on parentRevision for fix
  // If we're checked out on a branch, we're going to perform a stack fix later.
  // In order to allow the stack fix to cut out the old commit, we need to set
  // the prev ref here.
  if (currentBranch !== null) {
    currentBranch.savePrevRef();
  }

  gpExecSync(
    {
      command: `git rebase -i ${baseRev}`,
      options: { stdio: 'inherit' },
    },
    (err) => {
      if (rebaseInProgress()) {
        throw new RebaseConflictError(
          `Interactive rebase in progress.  After resolving merge conflicts, run 'gt continue'`,
          [
            {
              op: 'STACK_FIX' as const,
              sourceBranchName: currentBranch.name,
            },
          ],
          context
        );
      } else {
        throw new ExitFailedError(`Interactive rebase failed.`, err);
      }
    }
  );

  await rebaseUpstack(context);
}
