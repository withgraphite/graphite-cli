import { gpExecSync } from '../utils/exec_sync';

export function printStatus(): void {
  gpExecSync({
    command: `git status`,
    options: {
      printStdout: (out) => out.replace('git rebase --continue', 'gt continue'),
    },
  });
}
