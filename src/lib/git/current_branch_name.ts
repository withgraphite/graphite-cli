import { gpExecSync } from '../utils/exec_sync';

export function getCurrentBranchName(): string | undefined {
  const branchName = gpExecSync({
    command: `git branch --show-current`,
    onError: 'ignore',
  });

  return branchName.length > 0 ? branchName : undefined;
}
