import { gpExecSync } from '../utils/exec_sync';
export function detectStagedChanges(): boolean {
  return (
    gpExecSync({
      command: `git --no-pager diff --no-ext-diff --cached`,
    }).length > 0
  );
}
