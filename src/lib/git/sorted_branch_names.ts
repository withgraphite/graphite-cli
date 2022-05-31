import { gpExecSyncAndSplitLines } from '../utils/exec_sync';

export function sortedBranchNames(): string[] {
  return gpExecSyncAndSplitLines({
    command: `git for-each-ref --format='%(refname:short)' --sort=-committerdate refs/heads/`,
  });
}

export function branchNamesAndRevisions(): Record<string, string> {
  const branches: Record<string, string> = {};

  gpExecSyncAndSplitLines({
    command: `git for-each-ref --format='%(refname:short):%(objectname)' --sort=-committerdate refs/heads/`,
  })
    .map((line) => line.split(':'))
    .filter(
      (lineSplit): lineSplit is [string, string] =>
        lineSplit.length === 2 && lineSplit.every((s) => s.length > 0)
    )
    .forEach(([branchName, sha]) => (branches[branchName] = sha));

  return branches;
}
