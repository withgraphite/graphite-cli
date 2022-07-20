import fs from 'fs-extra';
import path from 'path';
import { runCommand } from '../utils/run_command';
export function rebaseInProgress(options?: { cwd: string }): boolean {
  let rebaseDir = path.join(
    runCommand({
      command: `git`,
      args: [`rev-parse`, `--git-dir`],
      ...options,
      onError: 'throw',
    }),
    'rebase-merge'
  );
  if (options?.cwd) {
    rebaseDir = path.join(options.cwd, rebaseDir);
  }
  return fs.existsSync(rebaseDir);
}
