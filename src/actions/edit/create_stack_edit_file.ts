import fs from 'fs-extra';
import path from 'path';
import Stack from '../../wrapper-classes/stack';

const FILE_NAME = 'graphite_stack_edit';
const COLUMN_SPACING = ' '.repeat(5);
const FILE_HEADER = [`Op  `, `Branch`].join(COLUMN_SPACING);
const FILE_DIVIDER = `-`.repeat(20);
const FILE_FOOTER =
  '# p, pick = stack branch upon the branch from the previous line';
export function createStackEditFile(opts: {
  stack: Stack;
  tmpDir: string;
}): string {
  const branchNames = opts.stack.branches().map((b) => b.name);
  branchNames.reverse(); // show the trunk at the bottom of the list to better match "upstack" and "downstack"
  const fileContents = [
    FILE_HEADER,
    FILE_DIVIDER,
    ...branchNames.map((b) => `pick${COLUMN_SPACING}${b}`),
    FILE_DIVIDER,
    FILE_FOOTER,
  ].join('\n');

  const filePath = path.join(opts.tmpDir, FILE_NAME);
  fs.writeFileSync(filePath, fileContents);
  return filePath;
}
