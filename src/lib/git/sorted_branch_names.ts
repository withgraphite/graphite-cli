import { runCommandAndSplitLines } from '../utils/run_command';

export function getBranchNamesAndRevisions(): Record<string, string> {
  const branches: Record<string, string> = {};

  runCommandAndSplitLines({
    command: `git`,
    args: [
      `for-each-ref`,
      `--format=%(refname:short):%(objectname)`,
      `--sort=-committerdate`,
      `refs/heads/`,
    ],
    onError: 'throw',
  })
    .map((line) => line.split(':'))
    .filter(
      (lineSplit): lineSplit is [string, string] =>
        lineSplit.length === 2 && lineSplit.every((s) => s.length > 0)
    )
    .forEach(([branchName, sha]) => (branches[branchName] = sha));

  return branches;
}
