import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function switchBranch(branch: string, opts?: { new?: boolean }): void {
  gpExecSync({
    command: `git switch ${opts?.new ? '-c ' : ''}${q(branch)}`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}
