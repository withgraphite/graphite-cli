import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';

export function getCommitterDate(args: {
  revision: string;
  timeFormat: 'UNIX_TIMESTAMP' | 'RELATIVE_READABLE';
}): string {
  const logFormat = {
    UNIX_TIMESTAMP: '%ct',
    RELATIVE_READABLE: '%cr',
  }[args.timeFormat];

  return gpExecSync(
    {
      command: `git log -1 --format=${logFormat} -n 1 ${args.revision} --`,
    },
    (err) => {
      throw new ExitFailedError(
        `Could not find commit for revision ${args.revision}.`,
        err
      );
    }
  );
}
