import { gpExecSync } from '../utils/exec_sync';

export function getUserEmail(): string {
  return gpExecSync({
    command: `git config user.email`,
  });
}
