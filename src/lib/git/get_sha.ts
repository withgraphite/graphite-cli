import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function getShaOrThrow(ref: string): string {
  return gpExecSync(
    { command: `git rev-parse ${q(ref)} 2>/dev/null` },
    (err) => {
      throw err;
    }
  );
}

export function getSha(ref: string): string | undefined {
  return (
    gpExecSync({
      command: `git rev-parse ${q(ref)} 2>/dev/null`,
    }) || undefined
  );
}

export function getRemoteSha(ref: string, remote: string): string | undefined {
  return (
    gpExecSync({
      command: `git ls-remote ${q(remote)} ${q(ref)} | cut -f1 -w`,
    }) || undefined
  );
}
