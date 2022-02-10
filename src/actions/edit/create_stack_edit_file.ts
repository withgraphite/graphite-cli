import fs from 'fs-extra';
import path from 'path';
import { getTrunk } from '../../lib/utils';
import Stack from '../../wrapper-classes/stack';

const FILE_NAME = 'graphite_stack_edit';
const COLUMN_SPACING = ' '.repeat(5);
const FILE_FOOTER = [
  '#',
  '# Operations:',
  "# p, pick = stack onto the proceeding line's branch",
];

/* Example file:

pick    gf--02-09-second
pick    gf--02-09-first

# pick  main (Bottom of stack)
#
# Operations:
# pick <branch_name> stack branch upon the branch from the previous line

*/

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
    ...branchNames.map((b) => `pick${COLUMN_SPACING}${b}`),
    `\n# pick   ${trunkName} (trunk, shown for orientation)`,
    ...FILE_FOOTER,
  ].join('\n');

  const filePath = path.join(opts.tmpDir, FILE_NAME);
  fs.writeFileSync(filePath, fileContents);
  return filePath;
}
