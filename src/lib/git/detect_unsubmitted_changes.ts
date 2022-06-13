import { ExitFailedError } from '../errors';
import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function detectUnsubmittedChanges(branchName: string): boolean {
  return (
    gpExecSync(
      {
        command: `git --no-pager log ${q(
          branchName
        )} --not --remotes --simplify-by-decoration --decorate --oneline --`,
      },
      () => {
        throw new ExitFailedError(
          `Failed to check current dir for untracked/uncommitted changes.`
        );
      }
    ).length !== 0
  );
}
