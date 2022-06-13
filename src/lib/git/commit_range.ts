import { q } from '../utils/escape_for_shell';
import { gpExecSyncAndSplitLines } from '../utils/exec_sync';

const FORMAT = { SHA: '%H', READABLE: '%h - %s' } as const;
export type TCommitFormat = keyof typeof FORMAT;

export function getCommitRange(
  base: string,
  head: string,
  format: TCommitFormat
): string[] {
  return gpExecSyncAndSplitLines({
    command: `git --no-pager log --pretty=format:"${FORMAT[format]}" ${q(
      base
    )}..${q(head)}`,
  });
}
