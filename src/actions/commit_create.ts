import { TContext } from '../lib/context/context';
import {
  ensureSomeStagedChangesPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../lib/preconditions';
import { logWarn } from '../lib/utils';
import { addAll } from '../lib/utils/addAll';
import { commit } from '../lib/utils/commit';
import { fixAction } from './fix';

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

  commit({ message: opts.message });

  try {
    uncommittedTrackedChangesPrecondition();
    await fixAction(
      {
        action: 'rebase',
        mergeConflictCallstack: [],
        scope: 'upstack',
      },
      context
    );
  } catch {
    logWarn(
      'Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix --rebase`'
    );
  }
}
