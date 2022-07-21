import { runCommand } from '../utils/run_command';

export function pruneRemote(remote: string): void {
  runCommand({
    command: `git`,
    args: [`remote`, `prune`, remote],
    onError: 'ignore',
  });
}
