import { runGitCommand } from '../utils/run_command';

export type TCommitOpts = {
  amend?: boolean;
  message?: string;
  noEdit?: boolean;
  edit?: boolean;
  patch?: boolean;
  rollbackOnError?: () => void;
};
export function commit(opts: TCommitOpts & { noVerify: boolean }): void {
  runGitCommand({
    args: [
      'commit',
      ...(opts.amend ? [`--amend`] : []),
      ...(opts.message ? [`-m`, opts.message] : []),
      ...(opts.noEdit ? [`--no-edit`] : []),
      ...(opts.edit ? [`-e`] : []),
      ...(opts.patch ? [`-p`] : []),
      ...(opts.noVerify ? ['-n'] : []),
    ],
    options: {
      stdio: 'inherit',
    },
    onError: () => {
      opts.rollbackOnError?.();
    },
    resource: 'commit',
  });
}
