import { gpExecSync } from '../utils/exec_sync';
import { rebaseInProgress } from './rebase_in_progress';

type TRebaseResult = 'REBASE_CONFLICT' | 'REBASE_DONE';
export function rebaseOnto(args: {
  onto: string;
  upstream: string;
  branchName: string;
}): TRebaseResult {
  gpExecSync({
    command: `git rebase --onto ${args.onto} ${args.upstream} ${args.branchName}`,
    options: { stdio: 'ignore' },
  });
  return rebaseInProgress() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}

export function rebaseContinue(): TRebaseResult {
  gpExecSync({
    command: `GIT_EDITOR=true git rebase --continue`,
    options: { stdio: 'ignore' },
  });
  return rebaseInProgress() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}

export function rebaseInteractive(args: {
  parentBranchRevision: string;
  branchName: string;
}): TRebaseResult {
  gpExecSync({
    command: `git rebase -i ${args.parentBranchRevision}`,
    options: { stdio: 'inherit' },
  });
  return rebaseInProgress() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}
