import fs from 'fs-extra';
import path from 'path';
import { gpExecSync } from '../utils/exec_sync';
export function rebaseInProgress(opts?: { dir: string }): boolean {
  let rebaseDir = path.join(
    gpExecSync({
      command: `git ${opts ? `-C "${opts.dir}"` : ''} rev-parse --git-dir`,
    }),
    'rebase-merge'
  );
  if (opts) {
    rebaseDir = path.join(opts.dir, rebaseDir);
  }
  return fs.existsSync(rebaseDir);
}
