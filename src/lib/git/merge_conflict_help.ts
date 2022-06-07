import { gpExecSyncAndSplitLines } from '../utils/exec_sync';

export function getUnmergedFiles(): string[] {
  return gpExecSyncAndSplitLines({
    command: `git --no-pager diff --no-ext-diff --name-only --diff-filter=U`,
  });
}
