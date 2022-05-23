import { gpExecSync } from '../utils/exec_sync';

export function isEmptyBranch(branchName: string, parentName: string): boolean {
  return (
    gpExecSync({
      command: `git diff --no-ext-diff ${parentName} ${branchName} -- `,
    }).length === 0
  );
}
