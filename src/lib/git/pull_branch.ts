import { runGitCommand } from '../utils/run_command';

export function pullBranch(remote: string, branchName: string): void {
  runGitCommand({
    args: [`pull`, `--ff-only`, remote, branchName],
    options: { stdio: 'pipe' },
    onError: 'throw',
    resource: 'pullBranch',
  });
}
