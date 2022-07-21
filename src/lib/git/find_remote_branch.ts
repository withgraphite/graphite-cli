import { runCommandAndSplitLines } from '../utils/run_command';

export function findRemoteBranch(remote: string): string | undefined {
  // e.g. for most repos: branch.main.remote origin
  // we take the first line of the output
  return (
    runCommandAndSplitLines({
      command: `git`,
      args: [`config`, `--get-regexp`, `remote$`, `^${remote}$`],
      onError: 'ignore',
    })[0]
      // and retrieve branchName from `branch.<branchName>.remote`
      ?.split('.')[1] || undefined
  );
}
