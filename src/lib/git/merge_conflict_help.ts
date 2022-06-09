import { gpExecSync, gpExecSyncAndSplitLines } from '../utils/exec_sync';

export function getUnmergedFiles(): string[] {
  return gpExecSyncAndSplitLines({
    command: `git --no-pager diff --no-ext-diff --name-only --diff-filter=U`,
  });
}

export function getRebaseHead(): string {
  return gpExecSync({
    command: `cat $(git rev-parse --git-dir)/rebase-merge/head-name`,
  }).slice('refs/heads/'.length);
}
