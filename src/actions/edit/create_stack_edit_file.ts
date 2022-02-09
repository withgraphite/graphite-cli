import fs from 'fs-extra';
import path from 'path';
import { getTrunk } from '../../lib/utils';
import Stack from '../../wrapper-classes/stack';

const FILE_NAME = 'graphite_stack_edit';
const COLUMN_SPACING = ' '.repeat(5);
const FILE_HEADER = [`# Op`, `Branch`].join(COLUMN_SPACING);
const FILE_DIVIDER = '# ' + `-`.repeat(20);
const FILE_FOOTER =
  '# p, pick = stack branch upon the branch from the previous line';
export function createStackEditFile(opts: {
  stack: Stack;
  tmpDir: string;
}): string {
  const trunkName = getTrunk().name;
  const branchNames = opts.stack
    .branches()
    .map((b) => b.name)
    .filter((n) => n !== trunkName);
  branchNames.reverse(); // show the trunk at the bottom of the list to better match "upstack" and "downstack"
  const fileContents = [
    FILE_HEADER,
    FILE_DIVIDER,
    ...branchNames.map((b) => `pick${COLUMN_SPACING}${b}`),
    `# pick   ${trunkName} (shown here for orientation)`,
    FILE_DIVIDER,
    FILE_FOOTER,
  ].join('\n');

  const filePath = path.join(opts.tmpDir, FILE_NAME);
  fs.writeFileSync(filePath, fileContents);
  return filePath;
}
