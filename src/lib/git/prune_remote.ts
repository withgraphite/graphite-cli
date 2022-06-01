import { gpExecSync } from '../utils/exec_sync';

export function pruneRemote(remote: string): void {
  gpExecSync({ command: `git remote prune ${remote}` });
}
