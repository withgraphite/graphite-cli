import { runGitCommand } from '../utils/run_command';

export function showCommits(base: string, head: string, patch?: boolean): void {
  runGitCommand({
    args: [
      `--no-pager`,
      `log`,
      ...(patch ? ['-p'] : []),
      `${base}..${head}`,
      `--`,
    ],
    options: { stdio: 'inherit' },
    onError: 'throw',
    resource: 'showCommits',
  });
}
