import { execSync } from 'child_process';

export function getUserEmail(): string | undefined {
  try {
    return execSync('git config user.email').toString().trim();
  } catch (err) {
    return undefined;
  }
}
