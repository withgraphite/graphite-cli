import { gpExecSyncAndSplitLines } from '../utils/exec_sync';

export function getUnmergedFiles(): string[] {
  return gpExecSyncAndSplitLines({
    command: `git diff --name-only --diff-filter=U`,
  });
}
