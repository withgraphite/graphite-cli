import { gpExecSync } from '../utils/exec_sync';

function doChangesExist(cmd: string): boolean {
  return (
    gpExecSync({
      command: cmd,
      onError: 'throw',
    }).length > 0
  );
}

export function unstagedChanges(): boolean {
  return doChangesExist(`git ls-files --others --exclude-standard`); // untracked changes only
}

export function trackedUncommittedChanges(): boolean {
  return doChangesExist(`git status -uno --porcelain=v1 2>/dev/null`); // staged but uncommitted changes only
}
