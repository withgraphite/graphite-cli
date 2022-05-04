import { ExitFailedError } from '../errors';
import { gpExecSync } from './exec_sync';

export function checkoutBranch(
  branch: string,
  opts?: { quiet?: boolean; new?: boolean }
): void {
  gpExecSync(
    {
      command: `git switch ${opts?.quiet ? '-q' : ''} ${
        opts?.new ? '-c' : ''
      }"${branch}"`,
    },
    () => {
      throw new ExitFailedError(
        `Failed to checkout ${opts?.new ? 'new ' : ''}branch (${branch})`
      );
    }
  );
}
