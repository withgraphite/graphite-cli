import { runGitCommand } from '../utils/run_command';

export function getUserEmail(): string {
  return runGitCommand({
    args: [`config`, `user.email`],
    onError: 'ignore',
    resource: 'getUserEmail',
  });
}
