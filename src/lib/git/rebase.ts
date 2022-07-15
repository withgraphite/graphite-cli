import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';
import { rebaseInProgress } from './rebase_in_progress';

type TRebaseResult = 'REBASE_CONFLICT' | 'REBASE_DONE';
export function rebase(args: {
  onto: string;
  from: string;
  branchName: string;
  restackCommitterDateIsAuthorDate?: boolean;
}): TRebaseResult {
  return rebaseInternal(
    `git rebase ${
      args.restackCommitterDateIsAuthorDate
        ? `--committer-date-is-author-date`
        : ''
    }--onto ${q(args.onto)} ${q(args.from)} ${q(args.branchName)}`
  );
}

export function rebaseContinue(): TRebaseResult {
  return rebaseInternal(`GIT_EDITOR=true git rebase --continue`);
}

export function rebaseAbort(): void {
  gpExecSync({
    command: `git rebase --abort`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function rebaseInteractive(args: {
  parentBranchRevision: string;
  branchName: string;
}): TRebaseResult {
  return rebaseInternal(
    `git rebase -i ${q(args.parentBranchRevision)} ${q(args.branchName)}`
  );
}

function rebaseInternal(command: string) {
  try {
    gpExecSync({
      command,
      options: { stdio: 'pipe' },
      onError: 'throw',
    });
  } catch (e) {
    if (rebaseInProgress()) {
      return 'REBASE_CONFLICT';
    } else {
      throw e;
    }
  }
  return 'REBASE_DONE';
}
