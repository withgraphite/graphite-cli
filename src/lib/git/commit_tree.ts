import { q } from '../utils/escape_for_shell';
import { gpExecSyncAndSplitLines } from '../utils/exec_sync';

export function getCommitTree(branchNames: string[]): Record<string, string[]> {
  const allBranches = branchNames.map((b) => q(b)).join(' ');
  const ret: Record<string, string[]> = {};
  gpExecSyncAndSplitLines({
    command:
      // Check that there is a commit behind this branch before getting the full list.
      `git rev-list --parents ^$(git merge-base --octopus ${allBranches})~1 ${allBranches} 2> /dev/null || git rev-list --parents --all`,
    options: {
      maxBuffer: 1024 * 1024 * 1024,
    },
    onError: 'throw',
  })
    .map((l) => l.split(' '))
    .forEach((l) => (ret[l[0]] = l.slice(1)));
  return ret;
}
