import fs from 'fs-extra';
import { TContext } from '../../lib/context/context';
import { ExitFailedError } from '../../lib/errors';
import { getTrunk } from '../../lib/utils';
import { getStackEditType, TStackEdit, TStackEditType } from './stack_edits';

// https://regex101.com/r/j0ohLA/1
const LINE_REGEX = /([a-z]*)[ ,]+(.*)/;

export function parseEditFile(
  opts: { filePath: string },
  context: TContext
): TStackEdit[] {
  const parsedEdit = fs
    .readFileSync(opts.filePath)
    .toString()
    .split('\n')
    .reverse()
    .map((line) =>
      line.substring(0, line.includes('#') ? line.indexOf('#') : line.length)
    )
    .filter((line) => line.length > 0)
    .map(parseLine);

  return parsedEdit.map((parsedStackEdit, index) => {
    // Assume all edits are PICKs for now
    if (parsedStackEdit.rest === getTrunk(context).name) {
      throw new ExitFailedError(`Cannot perform edits on trunk branch`);
    }
    return {
      type: parsedStackEdit.type,
      branchName: parsedStackEdit.rest,
      onto: index === 0 ? getTrunk(context).name : parsedEdit[index - 1].rest,
    };
  });
}

function parseLine(line: string): { type: TStackEditType; rest: string } {
  const match = line.match(LINE_REGEX);
  if (!match) {
    throw new ExitFailedError(`Invalid edit: ${line}`);
  }

  const type = getStackEditType(match[1]);
  if (!type) {
    throw new ExitFailedError(`Invalid edit: ${line}`);
  }

  return { type, rest: match[2] };
}
