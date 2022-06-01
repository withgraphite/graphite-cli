import { gpExecSync } from '../utils/exec_sync';

export function fetchBranch(remote: string, branchName: string): void {
  gpExecSync({ command: `git fetch -q  ${remote} ${branchName}` }, (err) => {
    throw err;
  });
}
export function readFetchHead(): string {
  return gpExecSync({ command: `git rev-parse FETCH_HEAD` });
}

export function readFetchBase(): string {
  return gpExecSync({ command: `git rev-parse FETCH_BASE` });
}

export function writeFetchBase(sha: string): void {
  gpExecSync({ command: `git update-ref FETCH_BASE ${sha}` }, (err) => {
    throw err;
  });
}
