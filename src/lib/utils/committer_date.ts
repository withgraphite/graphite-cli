import { ExitFailedError } from '../errors';
import { gpExecSync } from '../utils/exec_sync';
import { assertUnreachable } from './assert_unreachable';

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
