import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';

export function switchBranch(branch: string, opts?: { new?: boolean }): void {
  gpExecSync(
    {
      command: `git switch ${opts?.new ? '-c' : ''}"${branch}"`,
      options: { stdio: 'ignore' },
    },
    () => {
      throw new ExitFailedError(
        `Failed to switch to ${opts?.new ? 'new ' : ''}branch (${branch})`
      );
    }
  );
}
