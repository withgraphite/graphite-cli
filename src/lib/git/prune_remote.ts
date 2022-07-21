import { runGitCommand } from '../utils/run_command';

export function pruneRemote(remote: string): void {
  runGitCommand({
    args: [`remote`, `prune`, remote],
    onError: 'ignore',
    resource: 'pruneRemote',
  });
}
