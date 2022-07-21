import { runGitCommand } from '../utils/run_command';

export function addAll(): void {
  runGitCommand({
    args: ['add', '--all'],
    onError: 'throw',
    resource: 'addAll',
  });
}
