import { runGitCommand } from '../utils/run_command';

export function detectUnsubmittedChanges(
  branchName: string,
  remote: string
): boolean {
  return (
    runGitCommand({
      args: [
        `--no-pager`,
        `log`,
        `--oneline`,
        `${branchName}...${remote}/${branchName}`,
        `--`,
      ],
      onError: 'throw',
      resource: 'detectUnsubmittedChanges',
    }).length !== 0
  );
}

export function detectStagedChanges(): boolean {
  return (
    runGitCommand({
      args: [`--no-pager`, `diff`, `--no-ext-diff`, `--shortstat`, `--cached`],
      onError: 'throw',
      resource: 'detectStagedChanges',
    }).length > 0
  );
}

export function getUnstagedChanges(): string {
  return runGitCommand({
    args: [
      `-c`,
      `color.ui=always`,
      `--no-pager`,
      `diff`,
      `--no-ext-diff`,
      `--stat`,
    ],
    onError: 'throw',
    resource: 'getUnstagedChanges',
  });
}

export function showDiff(left: string, right: string): string {
  return runGitCommand({
    args: [
      `-c`,
      `color.ui=always`,
      `--no-pager`,
      `diff`,
      `--no-ext-diff`,
      left,
      right,
      `--`,
    ],
    onError: 'throw',
    resource: 'showDiff',
  });
}

export function isDiffEmpty(left: string, right: string): boolean {
  return (
    runGitCommand({
      args: [
        `--no-pager`,
        `diff`,
        `--no-ext-diff`,
        `--shortstat`,
        left,
        right,
        `--`,
      ],
      onError: 'throw',
      resource: 'isDiffEmpty',
    }).length === 0
  );
}
