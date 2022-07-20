import { runCommand } from '../utils/run_command';
import { rebaseInProgress } from './rebase_in_progress';

type TRebaseResult = 'REBASE_CONFLICT' | 'REBASE_DONE';
export function rebase(args: {
  onto: string;
  from: string;
  branchName: string;
  restackCommitterDateIsAuthorDate?: boolean;
}): TRebaseResult {
  return rebaseInternal([
    ...(args.restackCommitterDateIsAuthorDate
      ? [`--committer-date-is-author-date`]
      : []),
    `--onto`,
    args.onto,
    args.from,
    args.branchName,
  ]);
}

export function rebaseContinue(): TRebaseResult {
  return rebaseInternal(['--continue'], {
    env: { ...process.env, GIT_EDITOR: 'true' },
  });
}

export function rebaseAbort(): void {
  runCommand({
    command: `git`,
    args: [`rebase`, `--abort`],
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function rebaseInteractive(args: {
  parentBranchRevision: string;
  branchName: string;
}): TRebaseResult {
  return rebaseInternal([`-i`, args.parentBranchRevision, args.branchName]);
}

function rebaseInternal(args: string[], options?: { env: NodeJS.ProcessEnv }) {
  try {
    runCommand({
      command: 'git',
      args: ['rebase', ...args],
      options: { stdio: 'pipe', ...options },
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
