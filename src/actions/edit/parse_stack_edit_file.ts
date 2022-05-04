import fs from 'fs-extra';
import { TContext } from '../../lib/context/context';
import { ExitFailedError } from '../../lib/errors';
import { getTrunk } from '../../lib/utils';
import { getStackEditType, TStackEdit } from './stack_edits';

// https://regex101.com/r/j0ohLA/1
const LINE_REGEX = /([a-z]*)[ ,]+(.*)/;

export function parseEditFile(
  opts: { filePath: string },
  context: TContext
): TStackEdit[] {
  return fs
    .readFileSync(opts.filePath)
    .toString()
    .split('\n')
    .reverse()
    .map((line) =>
      line.substring(0, line.includes('#') ? line.indexOf('#') : line.length)
    )
    .filter((line) => line.length > 0)
    .map((line) => parseLine(line, context));
}

function parseLine(line: string, context: TContext): TStackEdit {
  const match = line.match(LINE_REGEX);
  if (!match) {
    throw new ExitFailedError(`Invalid edit: ${line}`);
  }

  const type = getStackEditType(match[1]);
  if (!type) {
    throw new ExitFailedError(`Invalid edit: ${line}`);
  }

  return {
    pick: (rest: string) => {
      if (rest === getTrunk(context).name) {
        throw new ExitFailedError(`Cannot perform edits on trunk branch`);
      }
      return {
        type: 'pick' as const,
        branchName: rest,
      };
    },
    exec: (rest: string) => {
      return {
        type: 'exec' as const,
        command: rest,
      };
    },
  }[type](match[2]);
}
