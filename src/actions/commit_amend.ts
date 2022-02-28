import { execStateConfig } from '../lib/config/exec_state_config';
import { TContext } from '../lib/context/context';
import { ExitFailedError } from '../lib/errors';
import { uncommittedTrackedChangesPrecondition } from '../lib/preconditions';
import { gpExecSync, logWarn } from '../lib/utils';
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
    gpExecSync(
      {
        command: 'git add --all',
      },
      (err) => {
        throw new ExitFailedError('Failed to add changes. Aborting...', err);
      }
    );
  }

  // If we're checked out on a branch, we're going to perform a stack fix later.
  // In order to allow the stack fix to cut out the old commit, we need to set
  // the prev ref here.
  const currentBranch = Branch.getCurrentBranch();
  if (currentBranch !== null) {
    currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
  }

  gpExecSync(
    {
      command: [
        `git commit --amend`,
        ...[
          opts.noEdit
            ? ['--no-edit']
            : opts.message
            ? [`-m ${opts.message}`]
            : [],
        ],
        ...[execStateConfig.noVerify() ? ['--no-verify'] : []],
      ].join(' '),
      options: { stdio: 'inherit' },
    },
    (err) => {
      throw new ExitFailedError('Failed to amend changes. Aborting...', err);
    }
  );
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
