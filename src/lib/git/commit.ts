import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';

const EMPTY_COMMIT_MESSAGE_INFO = [
  '\n',
  '# Since no changes were staged before creating this new branch,',
  '# Graphite has added an empty commit to track dependencies.',
  '# This is because two branches referencing one commit would break parent-child inference for Graphite',
  '#',
  '# You can remove the empty commit by running \\`gt commit amend\\`, or by squashing',
  '# If you wish to avoid empty commits in the future, stage changes before running \\`gt bc -m \\"feat(new_feat): added xyz...\\"\\`',
].join('\n');

export type TCommitOpts = {
  amend?: boolean;
  allowEmpty?: boolean;
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
        opts.allowEmpty ? `--allow-empty` : '',
        message
          ? `-m "${message}"`
          : opts.allowEmpty
          ? `-t ${stringToTmpFileInput(EMPTY_COMMIT_MESSAGE_INFO)}`
          : '',
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

function stringToTmpFileInput(contents: string): string {
  return `<(printf '%s\n' "${contents}")`;
}
