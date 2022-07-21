import { runCommand } from '../utils/run_command';

export function getMergeBase(left: string, right: string): string {
  return runCommand({
    command: `git`,
    args: [`merge-base`, left, right],
    onError: 'throw',
  });
}
