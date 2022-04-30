import { TContext } from '../lib/context/context';
import { ensureSomeStagedChangesPrecondition } from '../lib/preconditions';
import { addAll } from '../lib/utils/addAll';
import { commit } from '../lib/utils/commit';
import { Branch } from '../wrapper-classes/branch';
import { rebaseUpstack } from './fix';

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

  if (opts.noEdit) {
    ensureSomeStagedChangesPrecondition(context);
  }

  // If we're checked out on a branch, we're going to perform a stack fix later.
  // In order to allow the stack fix to cut out the old commit, we need to set
  // the prev ref here.
  const currentBranch = Branch.getCurrentBranch();
  if (currentBranch !== null) {
    currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
  }

  commit({ amend: true, noEdit: opts.noEdit, message: opts.message });

  await rebaseUpstack(context);
}
