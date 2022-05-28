import { gpExecSync } from '../utils/exec_sync';

export function getCommitTree(branchNames: string[]): Record<string, string[]> {
  const allBranches = branchNames.join(' ');
  const ret: Record<string, string[]> = {};
  gpExecSync({
    command:
      // Check that there is a commit behind this branch before getting the full list.
      `git rev-list --parents ^$(git merge-base --octopus ${allBranches})~1 ${allBranches} 2> /dev/null || git rev-list --parents --all`,
    options: {
      maxBuffer: 1024 * 1024 * 1024,
    },
  })
    .split('\n')
    .filter((l) => l.length > 0)
    .map((l) => l.split(' '))
    .forEach((l) => (ret[l[0]] = l.slice(1)));
  return ret;
}
