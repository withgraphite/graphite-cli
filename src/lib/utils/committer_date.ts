import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils';

export function getCommitterDate(args: {
  revision: string;
  timeFormat: 'UNIX_TIMESTAMP' | 'RELATIVE_READABLE';
}): string {
  let logFormat;
  switch (args.timeFormat) {
    case 'UNIX_TIMESTAMP':
      logFormat = '%ct';
      break;
    case 'RELATIVE_READABLE':
      logFormat = '%cr';
      break;
    default:
      assertUnreachable(args.timeFormat);
  }

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
  )
    .toString()
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}
