import { gpExecSync } from './exec_sync';
import { rebaseInProgress } from './rebase_in_progress';
import { logInfo } from './splog';

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
