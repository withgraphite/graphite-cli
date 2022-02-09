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

  parsedEdit.reverse(); // put trunk at the start of the list in memory, despite being bottom of list in file.

  if (parsedEdit[0].branchName !== getTrunk().name) {
    throw new ExitFailedError(
      `Cannot edit stack to no longer be branched off trunk`
    );
  }

  return parsedEdit
    .slice(1) // Remove the trunk
    .map((parsedStackEdit, index) => {
      // Assume all edits are PICKs for now
      return {
        type: parsedStackEdit.type,
        branchName: parsedStackEdit.branchName,
        onto: index === 0 ? getTrunk().name : parsedEdit[index].branchName,
      };
    });
}
