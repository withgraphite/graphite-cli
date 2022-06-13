import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function getMergeBase(left: string, right: string): string {
  return gpExecSync({
    command: `git merge-base ${q(left)} ${q(right)}`,
  });
}
