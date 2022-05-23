import { gpExecSync } from '../utils/exec_sync';
import { rebaseInProgress } from './rebase_in_progress';

export function printGraphiteMergeConflictStatus(): void {
  if (!rebaseInProgress()) {
    return;
  }

  gpExecSync({
    command: `git status`,
    options: {
      printStdout: (out) => out.replace('git rebase --continue', 'gt continue'),
    },
  });
}
