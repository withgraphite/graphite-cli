import { runCommand } from '../utils/run_command';

export function pullBranch(remote: string, branchName: string): void {
  runCommand({
    command: `git`,
    args: [`pull`, `--ff-only`, remote, branchName],
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}
