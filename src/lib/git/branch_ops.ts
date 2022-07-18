import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function getCurrentBranchName(): string | undefined {
  const branchName = gpExecSync({
    command: `git branch --show-current`,
    onError: 'ignore',
  });

  return branchName.length > 0 ? branchName : undefined;
}

export function branchMove(newName: string): void {
  gpExecSync({
    command: `git branch -m ${q(newName)}`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function deleteBranch(branchName: string): void {
  gpExecSync({
    command: `git branch -D ${q(branchName)}`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function switchBranch(
  branch: string,
  opts?: { new?: boolean; detach?: boolean; force?: boolean }
): void {
  gpExecSync({
    command: `git switch ${opts?.detach ? '-d ' : ''} ${
      opts?.force ? '-f ' : ''
    } ${opts?.new ? '-c ' : ''}${q(branch)}`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function forceCheckoutNewBranch(branchName: string, sha: string): void {
  gpExecSync({
    command: `git switch -C ${q(branchName)} ${q(sha)}`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function forceCreateBranch(branchName: string, sha: string): void {
  gpExecSync({
    command: `git branch -f  ${q(branchName)} ${q(sha)}`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}
