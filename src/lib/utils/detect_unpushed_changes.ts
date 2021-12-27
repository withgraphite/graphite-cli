import { execSync } from 'child_process';
import Branch from '../../wrapper-classes/branch';

export function detectUnpushedChanges(branch: Branch): boolean {
  try {
    execSync(
      `git log ${branch.name} --not --remotes --simplify-by-decoration --decorate --oneline`
    );
  } catch {
    return true;
  }
  // Diff succeeds if there are no staged changes.
  return false;
}
