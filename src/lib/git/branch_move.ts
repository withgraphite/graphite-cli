import { ExitFailedError } from '../errors';
import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function branchMove(newName: string): void {
  gpExecSync({ command: `git branch -m ${q(newName)}` }, (err) => {
    throw new ExitFailedError(`Failed to rename the current branch.`, err);
  });
}
