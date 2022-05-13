import { ExitFailedError } from '../errors';
import { gpExecSync } from './exec_sync';

export function copyFromRemote(branch: string, remote: string): void {
  gpExecSync(
    {
      command: `git branch -fq "${branch}" "${remote}/${branch}"`,
    },
    () => {
      throw new ExitFailedError(`Failed to copy ${branch} from remote.`);
    }
  );
}
