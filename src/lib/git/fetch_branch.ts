import { gpExecSync } from '../utils/exec_sync';
import { getShaOrThrow } from './get_sha';

const FETCH_HEAD = 'refs/gt-metadata/FETCH_HEAD';
const FETCH_BASE = 'refs/gt-metadata/FETCH_BASE';
export function fetchBranch(remote: string, branchName: string): void {
  gpExecSync(
    {
      command: `git fetch --no-write-fetch-head -q  ${remote} +${branchName}:${FETCH_HEAD}`,
    },
    (err) => {
      throw err;
    }
  );
}
export function readFetchHead(): string {
  return getShaOrThrow(FETCH_HEAD);
}

export function readFetchBase(): string {
  return getShaOrThrow(FETCH_BASE);
}

export function writeFetchBase(sha: string): void {
  gpExecSync({ command: `git update-ref ${FETCH_BASE} ${sha}` }, (err) => {
    throw err;
  });
}
