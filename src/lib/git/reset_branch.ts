import { runCommand } from '../utils/run_command';

export function softReset(sha: string): void {
  runCommand({
    command: `git`,
    args: [`reset`, `-q`, `--soft`, sha],
    onError: 'throw',
  });
}

export function trackedReset(sha: string): void {
  runCommand({
    command: `git`,
    args: [`reset`, `-Nq`, sha],
    onError: 'throw',
  });
}
