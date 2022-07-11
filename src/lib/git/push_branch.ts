import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function pushBranch(opts: {
  remote: string;
  branchName: string;
  noVerify: boolean;
  forcePush: boolean;
}): void {
  const forceOption = opts.forcePush ? '--force' : '--force-with-lease';

  gpExecSync(
    {
      command: [
        `git push ${q(opts.remote)}`,
        `${forceOption} ${q(opts.branchName)} 2>&1`,
        ...[opts.noVerify ? ['--no-verify'] : []],
      ].join(' '),
    },
    (err) => {
      throw err;
    }
  );
}
