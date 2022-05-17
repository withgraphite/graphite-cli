import { gpExecSync } from '../utils/exec_sync';

export function getBranchRevision(branchName: string): string {
  return gpExecSync({ command: `git rev-parse ${branchName}` });
}
