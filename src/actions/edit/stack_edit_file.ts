import fs from 'fs-extra';
import path from 'path';
import { TContext } from '../../lib/context';

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
    branchNames: string[];
    tmpDir: string;
  },
  context: TContext
): string {
  // show the trunk at the bottom of the list to better match "upstack" and "downstack"
  const fileContents = [
    ...opts.branchNames.reverse(),
    `# ${context.metaCache.trunk} (trunk, shown for orientation)`,
    ...FILE_FOOTER,
  ].join('\n');

  const filePath = path.join(opts.tmpDir, FILE_NAME);
  fs.writeFileSync(filePath, fileContents);
  return filePath;
}

export function parseEditFile(filePath: string): string[] {
  return fs
    .readFileSync(filePath)
    .toString()
    .split('\n')
    .reverse()
    .map((line) =>
      line.substring(0, line.includes('#') ? line.indexOf('#') : line.length)
    )
    .filter((line) => line.length > 0);
}
