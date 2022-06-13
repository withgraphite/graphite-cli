import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function pruneRemote(remote: string): void {
  gpExecSync({ command: `git remote prune ${q(remote)}` });
}
