import { q } from '../utils/escape_for_shell';
import { gpExecSync, gpExecSyncAndSplitLines } from '../utils/exec_sync';

const FORMAT = {
  READABLE: '%h - %s',
  SUBJECT: '%s',
  MESSAGE: '## %B%n',
  COMMITTER_DATE: '%cr',
  SHA: '%H',
} as const;
export type TCommitFormat = keyof typeof FORMAT;

export function getCommitRange(
  base: string,
  head: string,
  format: TCommitFormat
): string[] {
  return gpExecSyncAndSplitLines({
    command: `git --no-pager log --pretty=format:"%H" ${q(base)}..${q(head)}`,
  }).map((sha) =>
    gpExecSync({
      command: `git --no-pager log -1 --pretty=format:"${FORMAT[format]}" ${q(
        sha
      )}`,
    })
  );
}
