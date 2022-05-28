import { TContext } from '../../lib/context';
import { ExitFailedError } from '../../lib/errors';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { Branch } from '../../wrapper-classes/branch';

export function push(branch: Branch, context: TContext): void {
  gpExecSync(
    {
      command: [
        `git push ${context.repoConfig.getRemote()}`,
        `--force-with-lease ${branch.name} 2>&1`,
        ...[context.noVerify ? ['--no-verify'] : []],
      ].join(' '),
    },
    (err) => {
      context.splog.logError(
        `Failed to push changes for ${branch.name} to remote.`
      );

      context.splog.logTip(
        `There may be external commits on remote that were not overwritten with the attempted push.
      \n Use 'git pull' to pull external changes and retry.`
      );
      throw new ExitFailedError(err.stdout.toString());
    }
  );
}
