import { execSync } from 'child_process';
export function detectStagedChanges(): boolean {
  try {
    execSync(`git diff --no-ext-diff --cached --exit-code`);
  } catch {
    return true;
  }
  // Diff succeeds if there are no staged changes.
  return false;
}
