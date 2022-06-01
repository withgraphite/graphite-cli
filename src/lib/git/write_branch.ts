import { gpExecSync } from '../utils/exec_sync';

export function writeBranch(branchName: string, sha: string): void {
  gpExecSync({
    command: `git branch -f ${branchName} ${sha}`,
  });
}
