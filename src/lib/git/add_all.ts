import { runCommand } from '../utils/run_command';

export function addAll(): void {
  runCommand({ command: 'git', args: ['add', '--all'], onError: 'throw' });
}
