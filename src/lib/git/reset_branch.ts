import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function softReset(sha: string): void {
  gpExecSync({
    command: `git reset --soft ${q(sha)}`,
    onError: 'throw',
  });
}
