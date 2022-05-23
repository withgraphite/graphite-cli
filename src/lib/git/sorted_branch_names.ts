import { gpExecSync } from '../utils/exec_sync';

export function sortedBranchNames(): string[] {
  return gpExecSync({
    command: `git for-each-ref --format='%(refname:short)' --sort=-committerdate refs/heads/`,
  })
    .split('\n')
    .filter((branchName) => branchName.length > 0);
}
