import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function detectStagedChanges(): boolean {
  return (
    gpExecSync({
      command: `git --no-pager diff --no-ext-diff --shortstat --cached`,
    }).length > 0
  );
}

export function isDiffEmpty(left: string, right: string): boolean {
  return (
    gpExecSync({
      command: `git --no-pager diff --no-ext-diff --shortstat ${q(left)} ${q(
        right
      )} -- `,
    }).length === 0
  );
}
