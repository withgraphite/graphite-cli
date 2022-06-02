import { gpExecSync } from '../utils/exec_sync';

export function getShaOrThrow(ref: string): string {
  return gpExecSync({ command: `git rev-parse ${ref} 2>/dev/null` }, (err) => {
    throw err;
  });
}

export function getSha(ref: string): string | undefined {
  return (
    gpExecSync({ command: `git rev-parse ${ref} 2>/dev/null` }) || undefined
  );
}
