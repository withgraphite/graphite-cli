import { execSync } from 'child_process';

export function isEmptyBranch(branchName: string, parentName: string): boolean {
  try {
    execSync(
      `git diff --no-ext-diff --exit-code ${parentName} ${branchName} -- `
    );
  } catch {
    return false;
  }
  return true;
}
