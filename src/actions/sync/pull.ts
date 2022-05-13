import { TContext } from '../../lib/context';
import { ExitFailedError, PreconditionsFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { checkoutBranch } from '../../lib/utils/checkout_branch';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { logInfo, logNewline, logTip } from '../../lib/utils/splog';
import { getTrunk } from '../../lib/utils/trunk';

export function pull(context: TContext, oldBranchName: string): void {
  logInfo(`Pulling in new changes...`);
  logTip(
    `Disable this behavior at any point in the future with --no-pull`,
    context
  );

  const remote = context.repoConfig.getRemote();
  const trunk = getTrunk(context).name;

  if (currentBranchPrecondition(context).name !== trunk) {
    throw new PreconditionsFailedError('Must be on trunk to pull');
  }

  gpExecSync({ command: `git remote prune ${remote}` });
  gpExecSync(
    {
      command: `git fetch ${remote} "+refs/heads/*:refs/remotes/${remote}/*"`,
    },
    (err) => {
      checkoutBranch(oldBranchName, { quiet: true });
      throw new ExitFailedError(`Failed to fetch from remote ${remote}`, err);
    }
  );
  gpExecSync(
    { command: `git merge --ff-only "refs/remotes/${remote}/${trunk}"` },
    (err) => {
      checkoutBranch(oldBranchName, { quiet: true });
      throw new ExitFailedError(`Failed to fast-forward trunk ${trunk}`, err);
    }
  );

  logNewline();
}
