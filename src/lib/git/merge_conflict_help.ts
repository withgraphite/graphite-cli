import fs from 'fs-extra';
import path from 'path';
import { runCommand, runCommandAndSplitLines } from '../utils/run_command';

export function getUnmergedFiles(): string[] {
  return runCommandAndSplitLines({
    command: `git`,
    args: [
      `--no-pager`,
      `diff`,
      `--no-ext-diff`,
      `--name-only`,
      `--diff-filter=U`,
    ],
    onError: 'throw',
  });
}

export function getRebaseHead(): string {
  const gitDir = runCommand({
    command: `git`,
    args: [`rev-parse`, `--git-dir`],
    onError: 'throw',
  });

  return fs
    .readFileSync(path.join(`${gitDir}`, `rebase-merge`, `head-name`), {
      encoding: 'utf-8',
    })

    .slice('refs/heads/'.length);
}
