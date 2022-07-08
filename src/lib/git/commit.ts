import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';

export type TCommitOpts = {
  amend?: boolean;
  message?: string;
  noEdit?: boolean;
  rollbackOnError?: () => void;
};
export function commit(opts: TCommitOpts & { noVerify: boolean }): void {
  // We must escape all backticks in the string
  const message = opts.message?.replace(/`/g, '\\`');

  gpExecSync(
    {
      command: [
        'git commit',
        opts.amend ? `--amend` : '',
        message ? `-m "${message}"` : '',
        opts.noEdit ? `--no-edit` : '',
        opts.noVerify ? '-n' : '',
      ].join(' '),
      options: {
        stdio: 'inherit',
        shell: '/bin/bash',
      },
    },
    (err) => {
      opts.rollbackOnError?.();
      throw new ExitFailedError('Failed to commit changes. Aborting...', err);
    }
  );
}
