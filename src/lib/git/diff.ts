import { runCommand } from '../utils/run_command';

export function detectUnsubmittedChanges(
  branchName: string,
  remote: string
): boolean {
  return (
    runCommand({
      command: `git`,
      args: [
        `--no-pager`,
        `log`,
        `--oneline`,
        `${branchName}...${remote}/${branchName}`,
      ],
      onError: 'throw',
    }).length !== 0
  );
}

export function detectStagedChanges(): boolean {
  return (
    runCommand({
      command: `git`,
      args: [`--no-pager`, `diff`, `--no-ext-diff`, `--shortstat`, `--cached`],
      onError: 'throw',
    }).length > 0
  );
}

export function getUnstagedChanges(): string {
  return runCommand({
    command: `git`,
    args: [
      `-c`,
      `color.ui=always`,
      `--no-pager`,
      `diff`,
      `--no-ext-diff`,
      `--stat`,
    ],
    onError: 'throw',
  });
}

export function showDiff(left: string, right: string): void {
  runCommand({
    command: `git`,
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
    options: { stdio: 'inherit' },
    onError: 'throw',
  });
}

export function isDiffEmpty(left: string, right: string): boolean {
  return (
    runCommand({
      command: `git`,
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
    }).length === 0
  );
}
