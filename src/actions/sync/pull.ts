import { TContext } from '../../lib/context/context';
import { ExitFailedError, PreconditionsFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logInfo,
  logNewline,
  logTip,
} from '../../lib/utils';

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
      command: `git fetch ${remote} "+refs/heads/*:refs/remotes/${remote}/*"${
        context.userConfig.data.multiplayerEnabled
          ? ` "+refs/branch-metadata/*:refs/${remote}-branch-metadata/*"`
          : ''
      }`,
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
