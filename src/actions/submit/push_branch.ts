import { TContext } from '../../lib/context';
import { ExitFailedError } from '../../lib/errors';
import { gpExecSync } from '../../lib/utils/exec_sync';

export function push(branchName: string, context: TContext): void {
  gpExecSync(
    {
      command: [
        `git push ${context.repoConfig.getRemote()}`,
        `--force-with-lease ${branchName} 2>&1`,
        ...[context.noVerify ? ['--no-verify'] : []],
      ].join(' '),
    },
    (err) => {
      context.splog.logError(
        `Failed to push changes for ${branchName} to remote.`
      );

      context.splog.logTip(
        `There may be external commits on remote that were not overwritten with the attempted push.
      \n Use 'git pull' to pull external changes and retry.`
      );
      throw new ExitFailedError(err.stdout.toString());
    }
  );
}
