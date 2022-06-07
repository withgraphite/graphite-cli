import { gpExecSync } from '../utils/exec_sync';
import { isDiffEmpty } from './is_empty_branch';

export function isMerged({
  branchName,
  trunkName,
}: {
  branchName: string;
  trunkName: string;
}): boolean {
  // Are the changes on this branch already applied to main?
  if (
    gpExecSync({
      command: `git cherry ${trunkName} $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $(git merge-base ${branchName} ${trunkName}) -m _)`,
    }).startsWith('-')
  ) {
    return true;
  }

  // Is this branch in the same state as main?
  if (isDiffEmpty(branchName, trunkName)) {
    return true;
  }

  return false;
}
