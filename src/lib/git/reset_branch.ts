import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function softReset(sha: string): void {
  gpExecSync({
    command: `git reset -q --soft ${q(sha)}`,
    onError: 'throw',
  });
}

export function trackedReset(sha: string): void {
  gpExecSync({
    command: `git reset -Nq ${q(sha)}`,
    onError: 'throw',
  });
}
