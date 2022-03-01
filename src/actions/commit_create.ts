import { execStateConfig } from '../lib/config/exec_state_config';
import { TContext } from '../lib/context/context';
import { ExitFailedError } from '../lib/errors';
import {
  ensureSomeStagedChangesPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../lib/preconditions';
import { gpExecSync, logWarn } from '../lib/utils';
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

  if (opts.message !== undefined) {
    gpExecSync(
      {
        command: [
          'git commit',
          `-m "${opts.message}"`,
          ...[execStateConfig.noVerify() ? ['--no-verify'] : []],
        ].join(' '),
      },
      (err) => {
        throw new ExitFailedError('Failed to commit changes. Aborting...', err);
      }
    );
  } else {
    gpExecSync(
      {
        command: [
          'git commit',
          ...[execStateConfig.noVerify() ? ['--no-verify'] : []],
        ].join(' '),
        options: {
          stdio: 'inherit',
        },
      },
      (err) => {
        throw new ExitFailedError('Failed to commit changes. Aborting...', err);
      }
    );
  }

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
