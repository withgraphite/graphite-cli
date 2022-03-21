import { gpExecSync } from '.';
import { ExitFailedError } from '../errors';

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
