import { execSync } from 'child_process';

export function sortedBranchNames(): string[] {
  return execSync(
    `git for-each-ref --format='%(refname:short)' --sort=-committerdate refs/heads/`
  )
    .toString()
    .trim()
    .split('\n')
    .filter((branchName) => branchName.length > 0);
}
