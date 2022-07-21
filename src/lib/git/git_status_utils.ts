import { runGitCommand } from '../utils/run_command';

function doChangesExist(args: string[]): boolean {
  return (
    runGitCommand({
      args,
      onError: 'throw',
      resource: 'doChangesExist',
    }).length > 0
  );
}

export function unstagedChanges(): boolean {
  return doChangesExist([`ls-files`, `--others`, `--exclude-standard`]); // untracked changes only
}

export function trackedUncommittedChanges(): boolean {
  return doChangesExist([`status`, `-uno`, `--porcelain=v1`]); // staged but uncommitted changes only
}
