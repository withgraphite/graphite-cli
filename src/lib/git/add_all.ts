import { gpExecSync } from '../utils/exec_sync';

export function addAll(): void {
  gpExecSync({ command: 'git add --all', onError: 'throw' });
}
