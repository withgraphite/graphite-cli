import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export type TCommitOpts = {
  amend?: boolean;
  message?: string;
  noEdit?: boolean;
  edit?: boolean;
  patch?: boolean;
  rollbackOnError?: () => void;
};
export function commit(opts: TCommitOpts & { noVerify: boolean }): void {
  gpExecSync({
    command: [
      'git commit',
      opts.amend ? `--amend` : '',
      opts.message ? `-m ${q(opts.message)}` : '',
      opts.noEdit ? `--no-edit` : '',
      opts.edit ? `-e` : '',
      opts.patch ? `-p` : '',
      opts.noVerify ? '-n' : '',
    ].join(' '),
    options: {
      stdio: 'inherit',
    },
    onError: () => {
      opts.rollbackOnError?.();
    },
  });
}
