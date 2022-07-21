import { runGitCommand } from '../utils/run_command';

export function pushBranch(opts: {
  remote: string;
  branchName: string;
  noVerify: boolean;
  forcePush: boolean;
}): void {
  const forceOption = opts.forcePush ? '--force' : '--force-with-lease';

  runGitCommand({
    args: [
      `push`,
      `-u`,
      opts.remote,
      forceOption,
      opts.branchName,
      ...(opts.noVerify ? ['--no-verify'] : []),
    ],
    options: { stdio: 'pipe' },
    onError: 'throw',
    resource: 'pushBranch',
  });
}
