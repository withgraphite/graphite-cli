import { runCommand } from '../utils/run_command';

export function getCurrentBranchName(): string | undefined {
  const branchName = runCommand({
    command: `git`,
    args: [`branch`, `--show-current`],
    onError: 'ignore',
  });

  return branchName.length > 0 ? branchName : undefined;
}

export function branchMove(newName: string): void {
  runCommand({
    command: `git`,
    args: [`branch`, `-m`, newName],
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function deleteBranch(branchName: string): void {
  runCommand({
    command: `git`,
    args: [`branch`, `-D`, branchName],
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function switchBranch(
  branch: string,
  opts?: { new?: boolean; detach?: boolean; force?: boolean }
): void {
  runCommand({
    command: `git`,
    args: [
      `switch`,
      ...(opts?.detach ? ['-d'] : []),
      ...(opts?.force ? ['-f'] : []),
      ...(opts?.new ? ['-c'] : []),
      branch,
    ],
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function forceCheckoutNewBranch(branchName: string, sha: string): void {
  runCommand({
    command: `git`,
    args: [`switch`, `-C`, branchName, sha],
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function forceCreateBranch(branchName: string, sha: string): void {
  runCommand({
    command: `git`,
    args: [`branch`, `-f`, branchName, sha],
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}
