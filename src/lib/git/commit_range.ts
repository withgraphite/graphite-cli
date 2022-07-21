import {
  runGitCommand,
  runGitCommandAndSplitLines,
} from '../utils/run_command';

const FORMAT = {
  READABLE: '%h - %s',
  SUBJECT: '%s',
  MESSAGE: '%B%n',
  COMMITTER_DATE: '%cr',
  SHA: '%H',
} as const;
export type TCommitFormat = keyof typeof FORMAT;

export function getCommitRange(
  base: string | undefined,
  head: string,
  format: TCommitFormat
): string[] {
  return base // if no base is passed in, just get one commit (e.g. trunk)
    ? runGitCommandAndSplitLines({
        args: [`--no-pager`, `log`, `--pretty=format:%H`, `${base}..${head}`],
        onError: 'throw',
        resource: 'getCommitRangeHashes',
      }).map((sha) =>
        runGitCommand({
          args: [
            `--no-pager`,
            `log`,
            `-1`,
            `--pretty=format:${FORMAT[format]}`,
            sha,
          ],
          onError: 'throw',
          resource: 'getCommitRangeFormatted',
        })
      )
    : [
        runGitCommand({
          args: [
            `--no-pager`,
            `log`,
            `-1`,
            `--pretty=format:${FORMAT[format]}`,
            head,
          ],
          onError: 'throw',
          resource: 'getCommitRangeFormatted',
        }),
      ];
}
