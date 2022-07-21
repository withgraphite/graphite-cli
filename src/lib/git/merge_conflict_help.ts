import fs from 'fs-extra';
import path from 'path';
import {
  runGitCommand,
  runGitCommandAndSplitLines,
} from '../utils/run_command';

export function getUnmergedFiles(): string[] {
  return runGitCommandAndSplitLines({
    args: [
      `--no-pager`,
      `diff`,
      `--no-ext-diff`,
      `--name-only`,
      `--diff-filter=U`,
    ],
    onError: 'throw',
    resource: 'getUnmergedFiles',
  });
}

export function getRebaseHead(): string | undefined {
  const gitDir = runGitCommand({
    args: [`rev-parse`, `--git-dir`],
    onError: 'throw',
    resource: 'getRebaseHead',
  });

  const rebaseHeadPath = path.join(`${gitDir}`, `rebase-merge`, `head-name`);

  return fs.existsSync(rebaseHeadPath)
    ? fs
        .readFileSync(rebaseHeadPath, {
          encoding: 'utf-8',
        })
        .trim()
        .slice('refs/heads/'.length)
    : undefined;
}
