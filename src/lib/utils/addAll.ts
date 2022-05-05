import { ExitFailedError } from '../errors';
import { gpExecSync } from './exec_sync';

export function addAll(): void {
  gpExecSync(
    {
      command: 'git add --all',
    },
    (err) => {
      throw new ExitFailedError('Failed to add changes. Aborting...', err);
    }
  );
}
