import { execSync } from 'child_process';

export function branchExists(branchName: string): boolean {
  try {
    execSync(`git show-ref --quiet refs/heads/${branchName}`, {
      stdio: 'ignore',
    });
  } catch {
    return false;
  }
  return true;
}
