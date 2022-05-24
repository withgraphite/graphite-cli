import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';

function doChangesExist(cmd: string): boolean {
  return (
    gpExecSync(
      {
        command: cmd,
      },
      () => {
        throw new ExitFailedError(
          `Failed to check current dir for untracked/uncommitted changes.`
        );
      }
    ).length > 0
  );
}

export function unstagedChanges(): boolean {
  return doChangesExist(`git ls-files --others --exclude-standard`); // untracked changes only
}

export function trackedUncommittedChanges(): boolean {
  return doChangesExist(`git status -uno --porcelain=v1 2>/dev/null`); // staged but uncommitted changes only
}
