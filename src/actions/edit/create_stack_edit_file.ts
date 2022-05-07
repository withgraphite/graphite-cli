import fs from 'fs-extra';
import path from 'path';
import { TContext } from '../../lib/context';
import { getTrunk } from '../../lib/utils/trunk';
import { Stack } from '../../wrapper-classes/stack';

const FILE_NAME = 'graphite_stack_edit';
const COLUMN_SPACING = ' '.repeat(5);
const FILE_FOOTER = [
  '#',
  '# Operations (applied bottom to top):',
  '# p, pick <branch> = use branch (branches are rebased onto trunk in the specified order)',
  '# x, exec <command> = run command (the rest of the line) using shell',
];

/* Example file:

pick    gf--02-09-second
pick    gf--02-09-first

# pick  main (Bottom of stack)
#
# Operations:
# p, pick <branch> = use branch (branches are rebased onto trunk in the specified order)
# x, exec <command> = run command (the rest of the line) using shell
*/

export function createStackEditFile(
  opts: {
    stack: Stack;
    tmpDir: string;
  },
  context: TContext
): string {
  const trunkName = getTrunk(context).name;
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
