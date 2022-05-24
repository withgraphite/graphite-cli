import { TContext } from '../lib/context';
import { addAll } from '../lib/git/add_all';
import { commit } from '../lib/git/commit';
import {
  currentBranchPrecondition,
  ensureSomeStagedChangesPrecondition,
} from '../lib/preconditions';
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

  // TODO we will kill this once we cut over to relying on parentRevision for fix
  // If we're checked out on a branch, we're going to perform a stack fix later.
  // In order to allow the stack fix to cut out the old commit, we need to set
  // the prev ref here.
  currentBranchPrecondition().savePrevRef();

  commit({ amend: true, noEdit: opts.noEdit, message: opts.message });

  await rebaseUpstack(context);
}
