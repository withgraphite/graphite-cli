import { runGitCommandAndSplitLines } from '../utils/run_command';

export function getBranchNamesAndRevisions(): Record<string, string> {
  const branches: Record<string, string> = {};

  runGitCommandAndSplitLines({
    args: [
      `for-each-ref`,
      `--format=%(refname:short):%(objectname)`,
      `--sort=-committerdate`,
      `refs/heads/`,
    ],
    onError: 'throw',
    resource: 'getBranchNamesAndRevisions',
  })
    .map((line) => line.split(':'))
    .filter(
      (lineSplit): lineSplit is [string, string] =>
        lineSplit.length === 2 && lineSplit.every((s) => s.length > 0)
    )
    .forEach(([branchName, sha]) => (branches[branchName] = sha));

  return branches;
}
