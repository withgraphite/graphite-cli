import { gpExecSync } from '../utils/exec_sync';

export function sortedBranchNames(): string[] {
  return gpExecSync({
    command: `git for-each-ref --format='%(refname:short)' --sort=-committerdate refs/heads/`,
  })
    .split('\n')
    .filter((branchName) => branchName.length > 0);
}

export function branchNamesAndRevisions(): Map<string, string> {
  return new Map(
    gpExecSync({
      command: `git for-each-ref --format='%(refname:short):%(objectname)' refs/heads/`,
    })
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => line.split(':'))
      .filter(
        (lineSplit): lineSplit is [string, string] =>
          lineSplit.length === 2 && lineSplit.every((s) => s.length > 0)
      )
  );
}
