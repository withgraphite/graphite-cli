import { execSync } from 'child_process';

export function getBranchRevision(branchName: string): string {
  return execSync(`git rev-parse ${branchName}`).toString().trim();
}
