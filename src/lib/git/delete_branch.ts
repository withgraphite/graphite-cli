import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function deleteBranch(branchName: string): void {
  gpExecSync({
    command: `git branch -qD ${q(branchName)}`,
  });
}
