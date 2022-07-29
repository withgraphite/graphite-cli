import { runGitCommand } from '../utils/run_command';

export function showCommits(
  base: string,
  head: string,
  patch?: boolean
): string {
  return runGitCommand({
    args: [
      `--no-pager`,
      `log`,
      ...(patch ? ['-p'] : []),
      `${base}..${head}`,
      `--`,
    ],
    onError: 'throw',
    resource: 'showCommits',
  });
}
