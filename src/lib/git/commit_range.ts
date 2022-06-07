import { gpExecSync } from '../utils/exec_sync';

export function getCommitRange(base: string, head: string): string[] {
  return gpExecSync({
    command: `git log --pretty=format:"%H" ${base}..${head}`,
  })
    .trim()
    .split('\n');
}
