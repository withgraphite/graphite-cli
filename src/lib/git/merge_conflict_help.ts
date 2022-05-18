import { gpExecSync } from '../utils/exec_sync';

export function getUnmergedFiles(): string[] {
  return gpExecSync({
    command: `git diff --name-only --diff-filter=U`,
  }).split('\n');
}
