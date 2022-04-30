import { ExitFailedError } from '../errors';
import { gpExecSync } from './index';

export function checkoutBranch(
  branch: string,
  opts?: { quiet?: boolean }
): void {
  gpExecSync(
    { command: `git switch ${opts?.quiet ? '-q' : ''} "${branch}"` },
    (err) => {
      throw new ExitFailedError(`Failed to checkout branch (${branch})`, err);
    }
  );
}
