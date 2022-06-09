import chalk from 'chalk';
import { ExitFailedError } from '../errors';
import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function switchBranch(branch: string, opts?: { new?: boolean }): void {
  gpExecSync(
    {
      command: `git switch ${opts?.new ? '-c ' : ''}${q(branch)}`,
      options: { stdio: 'ignore' },
    },
    () => {
      throw new ExitFailedError(
        `Failed to switch to ${opts?.new ? 'new ' : ''}branch ${chalk.yellow(
          branch
        )}`
      );
    }
  );
}
