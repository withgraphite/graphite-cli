import { TContext } from '../lib/context';
import { PreconditionsFailedError } from '../lib/errors';
import { rebaseInteractive } from '../lib/git/rebase';
import { currentBranchPrecondition } from '../lib/preconditions';
import { rebaseUpstack } from './fix';

export async function editBranchAction(context: TContext): Promise<void> {
  const currentBranch = currentBranchPrecondition();

  const base = currentBranch.getParentBranchSha();
  if (!base) {
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

  rebaseInteractive({ base, currentBranchName: currentBranch.name }, context);

  await rebaseUpstack(context);
}
