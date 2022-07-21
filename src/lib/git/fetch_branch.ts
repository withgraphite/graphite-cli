import { runGitCommand } from '../utils/run_command';
import { getShaOrThrow } from './get_sha';

const FETCH_HEAD = 'refs/gt-metadata/FETCH_HEAD';
const FETCH_BASE = 'refs/gt-metadata/FETCH_BASE';
export function fetchBranch(remote: string, branchName: string): void {
  runGitCommand({
    args: [
      `fetch`,
      `--no-write-fetch-head`,
      `-f`,
      remote,
      `${branchName}:${FETCH_HEAD}`,
    ],
    options: { stdio: 'pipe' },
    onError: 'throw',
    resource: 'fetchBranch',
  });
}
export function readFetchHead(): string {
  return getShaOrThrow(FETCH_HEAD);
}

export function readFetchBase(): string {
  return getShaOrThrow(FETCH_BASE);
}

export function writeFetchBase(sha: string): void {
  runGitCommand({
    args: [`update-ref`, FETCH_BASE, sha],
    options: { stdio: 'pipe' },
    onError: 'throw',
    resource: 'writeFetchBase',
  });
}
