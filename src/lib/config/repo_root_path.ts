import { PreconditionsFailedError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';
import { cache } from './cache';
export function getRepoRootPath(): string {
  const cachedRepoRootPath = cache.getRepoRootPath();
  if (cachedRepoRootPath) {
    return cachedRepoRootPath;
  }
  const repoRootPath = gpExecSync(
    {
      command: `git rev-parse --git-dir`,
    },
    () => {
      return Buffer.alloc(0);
    }
  );
  if (!repoRootPath || repoRootPath.length === 0) {
    throw new PreconditionsFailedError('No .git repository found.');
  }
  cache.setRepoRootPath(repoRootPath);
  return repoRootPath;
}
