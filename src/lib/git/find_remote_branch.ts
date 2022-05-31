import { gpExecSyncAndSplitLines } from '../utils/exec_sync';

export function findRemoteBranch(remote: string): string | undefined {
  // e.g. for most repos: branch.main.remote origin
  // we take the first line of the output
  const branchName = gpExecSyncAndSplitLines({
    command: `git config --get-regexp remote$ "^${remote}$"`,
  })[0]
    // and retrieve branchName from `branch.<branchName>.remote`
    ?.split('.')[1];

  if (!branchName) {
    return undefined;
  }
  return branchName;
}
