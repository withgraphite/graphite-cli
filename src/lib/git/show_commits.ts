import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function showCommits(base: string, head: string, patch?: boolean): void {
  gpExecSync({
    command: `git --no-pager log ${patch ? '-p' : ''} ${q(base)}..${q(
      head
    )} --`,
    options: { stdio: 'inherit' },
  });
}
