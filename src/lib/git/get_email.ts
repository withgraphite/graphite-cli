import { runCommand } from '../utils/run_command';

export function getUserEmail(): string {
  return runCommand({
    command: `git`,
    args: [`config`, `user.email`],
    onError: 'ignore',
  });
}
