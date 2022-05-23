import { gpExecSync } from '../utils/exec_sync';

export function currentBranchName(): string | undefined {
  const head = gpExecSync({
    command: `git rev-parse --abbrev-ref HEAD`,
  });

  return head.length > 0 && head !== 'HEAD' ? head : undefined;
}
