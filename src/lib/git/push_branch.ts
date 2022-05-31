import { gpExecSync } from '../utils/exec_sync';

export function pushBranch(opts: {
  remote: string;
  branchName: string;
  noVerify: boolean;
}): void {
  gpExecSync(
    {
      command: [
        `git push ${opts.remote}`,
        `--force-with-lease ${opts.branchName} 2>&1`,
        ...[opts.noVerify ? ['--no-verify'] : []],
      ].join(' '),
    },
    (err) => {
      throw err;
    }
  );
}
