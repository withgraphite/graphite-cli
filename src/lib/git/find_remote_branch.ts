import { runGitCommandAndSplitLines } from '../utils/run_command';

export function findRemoteBranch(remote: string): string | undefined {
  // e.g. for most repos: branch.main.remote origin
  // we take the first line of the output
  return (
    runGitCommandAndSplitLines({
      args: [`config`, `--get-regexp`, `remote$`, `^${remote}$`],
      onError: 'ignore',
      resource: 'findRemoteBranch',
    })[0]
      // and retrieve branchName from `branch.<branchName>.remote`
      ?.split('.')[1] || undefined
  );
}
