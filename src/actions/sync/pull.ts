import { TContext } from '../../lib/context';
import { ExitFailedError, PreconditionsFailedError } from '../../lib/errors';
import { getRemoteBranchNames } from '../../lib/git/get_remote_branch_names';
import { switchBranch } from '../../lib/git/switch_branch';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { getTrunk } from '../../lib/utils/trunk';

export function pull(
  args: { oldBranchName: string; branchesToFetch: string[] },
  context: TContext
): void {
  const { oldBranchName, branchesToFetch } = args;
  context.splog.logInfo(`Pulling in new changes...`);
  context.splog.logTip(
    `Disable this behavior at any point in the future with --no-pull`
  );

  const remote = context.repoConfig.getRemote();
  const trunk = getTrunk(context).name;

  if (currentBranchPrecondition().name !== trunk) {
    throw new PreconditionsFailedError('Must be on trunk to pull');
  }

  gpExecSync({ command: `git remote prune ${remote}` });

  const input = getRemoteBranchNames(context)
    .filter((name) => branchesToFetch.includes(name))
    .join('\n');

  context.splog.logDebug(`Fetching branches:\n${input}`);

  gpExecSync(
    {
      command: `git fetch ${remote} --stdin --no-write-fetch-head`,
      options: { input },
    },
    (err) => {
      switchBranch(oldBranchName);
      throw new ExitFailedError(`Failed to fetch from remote ${remote}`, err);
    }
  );

  gpExecSync(
    { command: `git merge --ff-only "refs/remotes/${remote}/${trunk}"` },
    (err) => {
      switchBranch(oldBranchName);
      throw new ExitFailedError(`Failed to fast-forward trunk ${trunk}`, err);
    }
  );

  context.splog.logNewline();
}
