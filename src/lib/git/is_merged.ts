import { runCommand } from '../utils/run_command';
import { isDiffEmpty } from './diff';
import { getMergeBase } from './merge_base';

export function isMerged({
  branchName,
  trunkName,
}: {
  branchName: string;
  trunkName: string;
}): boolean {
  const sha = runCommand({
    command: `git`,
    args: [
      `commit-tree`,
      `${branchName}^{tree}`,
      `-p`,
      getMergeBase(branchName, trunkName),
      `-m`,
      `_`,
    ],
    onError: 'ignore',
  });

  // Are the changes on this branch already applied to main?
  if (
    sha &&
    runCommand({
      command: `git`,
      args: [`cherry`, trunkName, sha],
      onError: 'ignore',
    }).startsWith('-')
  ) {
    return true;
  }

  // Is this branch in the same state as main?
  return isDiffEmpty(branchName, trunkName);
}
