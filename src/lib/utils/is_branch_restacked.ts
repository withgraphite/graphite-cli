import Branch from '../../wrapper-classes/branch';
import { PreconditionsFailedError } from '../errors';

export function isBranchRestacked(branch: Branch): boolean {
  return getBranchBaseName(branch) !== branch.getPRInfo()?.base;
}

function getBranchBaseName(branch: Branch): string {
  const parent = branch.getParentFromMeta();
  if (parent === undefined) {
    throw new PreconditionsFailedError(
      `Could not find parent for branch ${branch.name} to submit PR against. Please checkout ${branch.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`
    );
  }
  return parent.name;
}
