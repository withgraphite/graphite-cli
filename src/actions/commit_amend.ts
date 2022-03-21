import { TContext } from '../lib/context/context';
import { uncommittedTrackedChangesPrecondition } from '../lib/preconditions';
import { logWarn } from '../lib/utils';
import { addAll } from '../lib/utils/addAll';
import { commit } from '../lib/utils/commit';
import { Branch } from '../wrapper-classes/branch';
import { fixAction } from './fix';

export async function commitAmendAction(
  opts: {
    addAll: boolean;
    message?: string;
    noEdit: boolean;
  },
  context: TContext
): Promise<void> {
  if (opts.addAll) {
    addAll();
  }

  // If we're checked out on a branch, we're going to perform a stack fix later.
  // In order to allow the stack fix to cut out the old commit, we need to set
  // the prev ref here.
  const currentBranch = Branch.getCurrentBranch();
  if (currentBranch !== null) {
    currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
  }

  commit({ amend: true, noEdit: opts.noEdit, message: opts.message });

  // Only restack if working tree is now clean.
  try {
    uncommittedTrackedChangesPrecondition();
    await fixAction(
      {
        action: 'rebase',
        mergeConflictCallstack: [],
      },
      context
    );
  } catch {
    logWarn(
      'Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix --rebase`'
    );
  }
}
