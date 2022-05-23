import { gpExecSync } from '../utils/exec_sync';

export function branchExists(branchName: string): boolean {
  return (
    gpExecSync({
      command: `git show-ref refs/heads/${branchName}`,
    }).length > 0
  );
}
