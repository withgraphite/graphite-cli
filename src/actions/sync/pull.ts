import { TContext } from '../../lib/context';
import { ExitFailedError } from '../../lib/errors';
import { getRemoteBranchNames } from '../../lib/git/get_remote_branch_names';
import { switchBranch } from '../../lib/git/switch_branch';
import { gpExecSync } from '../../lib/utils/exec_sync';

export function pull(branchesToFetch: string[], context: TContext): void {
  const remote = context.repoConfig.getRemote();

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
      throw new ExitFailedError(`Failed to fetch from remote ${remote}`, err);
    }
  );

  const currentBranchName = context.metaCache.currentBranch;
  const trunk = context.metaCache.trunk;
  context.metaCache.checkoutBranch(trunk);
  gpExecSync(
    { command: `git merge --ff-only "refs/remotes/${remote}/${trunk}"` },
    (err) => {
      if (currentBranchName) {
        switchBranch(currentBranchName);
      }
      throw new ExitFailedError(`Failed to fast-forward trunk ${trunk}`, err);
    }
  );
  if (currentBranchName) {
    switchBranch(currentBranchName);
  }
}
