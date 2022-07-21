import { runGitCommand } from '../utils/run_command';

export function getShaOrThrow(ref: string): string {
  return runGitCommand({
    args: [`rev-parse`, ref],
    onError: 'throw',
    resource: 'getShaOrThrow',
  });
}

export function getSha(ref: string): string {
  return runGitCommand({
    args: [`rev-parse`, ref],
    onError: 'ignore',
    resource: 'getSha',
  });
}

export function getRemoteSha(ref: string, remote: string): string | undefined {
  const output = runGitCommand({
    args: [`ls-remote`, remote, ref],
    onError: 'ignore',
    resource: 'getRemoteSha',
  });
  return output.slice(0, output.search(/\s/)) || undefined;
}
