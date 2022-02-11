import fs from 'fs-extra';
import { ExitFailedError } from '../../lib/errors';
import { getTrunk } from '../../lib/utils';
import {
  isValidStackEditType,
  TStackEdit,
  TStackEditType,
} from './stack_edits';

export function parseEditFile(opts: { filePath: string }): TStackEdit[] {
  const fileContents = fs.readFileSync(opts.filePath).toString();
  const parsedEdit = fileContents
    .split('\n')
    .map((line) => line.split(/[ ,]+/))
    .filter((lineParts) => {
      // Each line, we want to split into two parts (edit type and branch name)
      return lineParts.length === 2 && isValidStackEditType(lineParts[0]);
    })
    .map((lineParts) => {
      return { type: lineParts[0] as TStackEditType, branchName: lineParts[1] };
    });

  parsedEdit.reverse();

  if (parsedEdit.map((e) => e.branchName).includes(getTrunk().name)) {
    throw new ExitFailedError(`Cannot perform edits on trunk branch`);
  }

  return parsedEdit.map((parsedStackEdit, index) => {
    // Assume all edits are PICKs for now
    return {
      type: parsedStackEdit.type,
      branchName: parsedStackEdit.branchName,
      onto: index === 0 ? getTrunk().name : parsedEdit[index - 1].branchName,
    };
  });
}
