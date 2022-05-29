import { gpExecSync } from '../utils/exec_sync';

const GIT_LOG_FORMAT = {
  BODY: '%b' as const,
  SUBJECT: '%s' as const,
};

export function getCommitMessage(
  sha: string,
  format: keyof typeof GIT_LOG_FORMAT
): string {
  return gpExecSync({
    command: `git log --format=${GIT_LOG_FORMAT[format]} -n 1 ${sha} --`,
  });
}
