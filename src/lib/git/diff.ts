import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function detectUnsubmittedChanges(
  branchName: string,
  remote: string
): boolean {
  return (
    gpExecSync({
      command: `git --no-pager diff --shortstat ${q(branchName)} ${q(
        remote
      )}/${q(branchName)} `,
      onError: 'throw',
    }).length !== 0
  );
}

export function detectStagedChanges(): boolean {
  return (
    gpExecSync({
      command: `git --no-pager diff --no-ext-diff --shortstat --cached`,
      onError: 'throw',
    }).length > 0
  );
}

export function isDiffEmpty(left: string, right: string): boolean {
  return (
    gpExecSync({
      command: `git --no-pager diff --no-ext-diff --shortstat ${q(left)} ${q(
        right
      )} -- `,
      onError: 'throw',
    }).length === 0
  );
}
