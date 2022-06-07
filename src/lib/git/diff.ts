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
      command: `git --no-pager diff --no-ext-diff --shortstat ${left} ${right} -- `,
    }).length === 0
  );
}
