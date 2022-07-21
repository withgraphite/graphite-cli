import { runCommand } from '../utils/run_command';

export function getShaOrThrow(ref: string): string {
  return runCommand({
    command: `git`,
    args: [`rev-parse`, ref],
    onError: 'throw',
  });
}

export function getSha(ref: string): string {
  return runCommand({
    command: `git`,
    args: [`rev-parse`, ref],
    onError: 'ignore',
  });
}

export function getRemoteSha(ref: string, remote: string): string | undefined {
  const output = runCommand({
    command: `git`,
    args: [`ls-remote`, remote, ref],
    onError: 'ignore',
  });
  return output.slice(0, output.search(/\s/)) || undefined;
}
