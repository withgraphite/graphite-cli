import { TContext } from '../lib/context/context';
import { ExitFailedError } from '../lib/errors';
import {
  ensureSomeStagedChangesPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../lib/preconditions';
import { gpExecSync, logWarn } from '../lib/utils';
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
    gpExecSync(
      {
        command: 'git add --all',
      },
      (err) => {
        throw new ExitFailedError('Failed to add changes. Aborting...', err);
      }
    );
  }

  ensureSomeStagedChangesPrecondition(context);

  commit({ message: opts.message });

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
