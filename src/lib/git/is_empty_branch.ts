import { gpExecSync } from '../utils/exec_sync';

export function isDiffEmpty(left: string, right: string): boolean {
  return (
    gpExecSync({
      command: `git --no-pager diff --no-ext-diff ${left} ${right} -- `,
    }).length === 0
  );
}
