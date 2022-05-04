import { ExitFailedError } from '../errors';
import { gpExecSync } from './index';

export function checkoutBranch(
  branch: string,
  opts?: { quiet?: boolean }
): void {
  gpExecSync(
    { command: `git switch ${opts?.quiet ? '-q' : ''} "${branch}"` },
    () => {
      throw new ExitFailedError(`Failed to checkout branch (${branch})`);
    }
  );
}
