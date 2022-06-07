import { gpExecSync } from '../utils/exec_sync';
import { rebaseInProgress } from './rebase_in_progress';

type TRebaseResult = 'REBASE_CONFLICT' | 'REBASE_DONE';
export function restack(args: {
  parentBranchName: string;
  parentBranchRevision: string;
  branchName: string;
}): TRebaseResult {
  gpExecSync({
    command: `git rebase --onto ${args.parentBranchName} ${args.parentBranchRevision} ${args.branchName}`,
    options: { stdio: 'ignore' },
  });
  return rebaseInProgress() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}

export function restackContinue(): TRebaseResult {
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
