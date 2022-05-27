import { gpExecSync } from '../utils/exec_sync';

const FORMAT = { SHA: '%H', READABLE: '%h - %s' } as const;
export type TCommitFormat = keyof typeof FORMAT;

export function getCommitRange(
  base: string,
  head: string,
  format: TCommitFormat
): string[] {
  return gpExecSync({
    command: `git --no-pager log --pretty=format:"${FORMAT[format]}" ${base}..${head}`,
  })
    .trim()
    .split('\n');
}
