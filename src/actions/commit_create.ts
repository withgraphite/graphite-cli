import { TContext } from '../lib/context';
import {
  currentBranchPrecondition,
  ensureSomeStagedChangesPrecondition,
} from '../lib/preconditions';
import { addAll } from '../lib/utils/addAll';
import { commit } from '../lib/utils/commit';
import { rebaseUpstack } from './fix';

export async function commitCreateAction(
  opts: {
    addAll: boolean;
    message: string | undefined;
  },
  context: TContext
): Promise<void> {
  if (opts.addAll) {
    addAll();
  }

  ensureSomeStagedChangesPrecondition(context);

  // TODO we will kill this once we cut over to relying on parentRevision for fix
  // If we're checked out on a branch, we're going to perform a stack fix later.
  // In order to allow the stack fix to cut out the old commit, we need to set
  // the prev ref here.
  currentBranchPrecondition(context).savePrevRef();

  commit({ message: opts.message });

  await rebaseUpstack(context);
}
