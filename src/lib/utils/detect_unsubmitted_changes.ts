import { Branch } from '../../wrapper-classes/branch';
import { ExitFailedError } from '../errors';
import { gpExecSync } from './exec_sync';

export function detectUnsubmittedChanges(branch: Branch): boolean {
  return (
    gpExecSync(
      {
        command: `git log ${branch.name} --not --remotes --simplify-by-decoration --decorate --oneline --`,
      },
      () => {
        throw new ExitFailedError(
          `Failed to check current dir for untracked/uncommitted changes.`
        );
      }
    )
      .toString()
      .trim().length !== 0
  );
}
