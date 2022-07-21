import fs from 'fs-extra';
import path from 'path';
import { runGitCommand } from '../utils/run_command';
export function rebaseInProgress(options?: { cwd: string }): boolean {
  let rebaseDir = path.join(
    runGitCommand({
      args: [`rev-parse`, `--git-dir`],
      options,
      onError: 'throw',
      resource: 'rebaseInProgress',
    }),
    'rebase-merge'
  );
  if (options?.cwd) {
    rebaseDir = path.join(options.cwd, rebaseDir);
  }
  return fs.existsSync(rebaseDir);
}
