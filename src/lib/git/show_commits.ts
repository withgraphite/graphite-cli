import { gpExecSync } from '../utils/exec_sync';

export function showCommits(base: string, head: string, patch?: boolean): void {
  gpExecSync({
    command: `git --no-pager log ${patch ? '-p' : ''} ${base}..${head} --`,
    options: { stdio: 'inherit' },
  });
}
