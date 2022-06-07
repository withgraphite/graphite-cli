import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';

export function branchMove(newName: string): void {
  gpExecSync({ command: `git branch -m ${newName}` }, (err) => {
    throw new ExitFailedError(`Failed to rename the current branch.`, err);
  });
}
