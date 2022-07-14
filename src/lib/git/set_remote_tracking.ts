import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function setRemoteTracking({
  remote,
  branchName,
  sha,
}: {
  remote: string;
  branchName: string;
  sha: string;
}): void {
  gpExecSync({
    command: `git update-ref refs/remotes/${q(remote)}/${q(branchName)} ${q(
      sha
    )}`,
    onError: 'throw',
  });
}
