import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function forceCreateBranch(branchName: string, sha: string): void {
  gpExecSync({
    command: `git switch -qC ${q(branchName)} ${q(sha)}`,
  });
}
