import fs from 'fs-extra';
import path from 'path';
import { TContext } from '../../lib/context';
import { getTrunk } from '../../lib/utils/trunk';
import { Stack } from '../../wrapper-classes/stack';

const FILE_NAME = 'graphite_stack_edit';
const FILE_FOOTER = [
  '#',
  '# Stack will be rearranged on trunk to match the above order.',
];

/* Example file:

gf--02-09-second
gf--02-09-first
# main (trunk, shown for orientation)
#
# Stack will be rearranged on trunk to match the above order.
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
  const fileContents = [...branchNames, `# ${trunkName} `, ...FILE_FOOTER].join(
    '\n'
  );

  const filePath = path.join(opts.tmpDir, FILE_NAME);
  fs.writeFileSync(filePath, fileContents);
  return filePath;
}
