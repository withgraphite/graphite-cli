import { runCommand, runCommandAndSplitLines } from '../utils/run_command';

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
    ? runCommandAndSplitLines({
        command: `git`,
        args: [`--no-pager`, `log`, `--pretty=format:%H`, `${base}..${head}`],
        onError: 'throw',
      }).map((sha) =>
        runCommand({
          command: `git`,
          args: [
            `--no-pager`,
            `log`,
            `-1`,
            `--pretty=format:${FORMAT[format]}`,
            sha,
          ],
          onError: 'throw',
        })
      )
    : [
        runCommand({
          command: `git`,
          args: [
            `--no-pager`,
            `log`,
            `-1`,
            `--pretty=format:${FORMAT[format]}`,
            head,
          ],
          onError: 'throw',
        }),
      ];
}
