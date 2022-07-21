import { runGitCommand } from '../utils/run_command';

export function setRemoteTracking({
  remote,
  branchName,
  sha,
}: {
  remote: string;
  branchName: string;
  sha: string;
}): void {
  runGitCommand({
    args: [`update-ref`, `refs/remotes/${remote}/${branchName}`, sha],
    onError: 'throw',
    resource: 'setRemoteTracking',
  });
}
