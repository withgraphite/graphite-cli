import { runCommand } from '../utils/run_command';

export function setRemoteTracking({
  remote,
  branchName,
  sha,
}: {
  remote: string;
  branchName: string;
  sha: string;
}): void {
  runCommand({
    command: `git`,
    args: [`update-ref`, `refs/remotes/${remote}/${branchName}`, sha],
    onError: 'throw',
  });
}
