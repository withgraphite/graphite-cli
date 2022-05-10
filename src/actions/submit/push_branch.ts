import { execStateConfig } from '../../lib/config/exec_state_config';
import { TContext } from '../../lib/context';
import { ExitFailedError } from '../../lib/errors';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { logError, logTip } from '../../lib/utils/splog';
import { Branch } from '../../wrapper-classes/branch';

export function push(branch: Branch, context: TContext): void {
  gpExecSync(
    {
      command: [
        `git push ${context.repoConfig.getRemote()}`,
        `--force-with-lease ${branch.name} 2>&1`,
        ...[execStateConfig.noVerify() ? ['--no-verify'] : []],
      ].join(' '),
    },
    (err) => {
      logError(`Failed to push changes for ${branch.name} to remote.`);

      logTip(
        `There may be external commits on remote that were not overwritten with the attempted push.
      \n Use 'git pull' to pull external changes and retry.`,
        context
      );
      throw new ExitFailedError(err.stderr.toString());
    }
  );
}
