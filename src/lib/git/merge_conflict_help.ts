import { gpExecSync } from '../utils/exec_sync';
import { logInfo } from '../utils/splog';
import { rebaseInProgress } from './rebase_in_progress';

export function printGraphiteMergeConflictStatus(): void {
  if (!rebaseInProgress()) {
    return;
  }

  const statusOutput = gpExecSync({
    command: `git status`,
  })
    .toString()
    .trim();

  const output = [
    statusOutput.replace('git rebase --continue', 'gt continue'),
  ].join('\n');

  logInfo(output);
}
