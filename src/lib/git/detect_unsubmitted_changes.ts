import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';

export function detectUnsubmittedChanges(branchName: string): boolean {
  return (
    gpExecSync(
      {
        command: `git log ${branchName} --not --remotes --simplify-by-decoration --decorate --oneline --`,
      },
      () => {
        throw new ExitFailedError(
          `Failed to check current dir for untracked/uncommitted changes.`
        );
      }
    ).length !== 0
  );
}
