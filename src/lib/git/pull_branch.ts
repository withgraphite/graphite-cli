import { gpExecSync } from '../utils/exec_sync';

export function pullBranch(remote: string, branchName: string): void {
  gpExecSync(
    { command: `git pull -q --ff-only ${remote} ${branchName}` },
    (err) => {
      throw err;
    }
  );
}
