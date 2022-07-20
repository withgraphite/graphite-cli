import { runCommand } from '../utils/run_command';

export function showCommits(base: string, head: string, patch?: boolean): void {
  runCommand({
    command: `git`,
    args: [
      `--no-pager`,
      `log`,
      ...(patch ? ['-p'] : []),
      `${base}..${head}`,
      `--`,
    ],
    options: { stdio: 'inherit' },
    onError: 'throw',
  });
}
