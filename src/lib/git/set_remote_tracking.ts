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
  gpExecSync(
    { command: `git update-ref refs/remotes/${remote}/${branchName} ${sha}` },
    (err) => {
      throw err;
    }
  );
}
