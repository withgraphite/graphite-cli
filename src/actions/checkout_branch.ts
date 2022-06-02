import chalk from 'chalk';
import { TContext } from '../lib/context';

export function checkoutBranch(branchName: string, context: TContext): void {
  if (branchName === context.metaCache.currentBranch) {
    context.splog.logInfo(`Already on ${chalk.cyan(branchName)}.`);
    return;
  }
  context.metaCache.checkoutBranch(branchName);
  context.splog.logInfo(`Checked out ${chalk.cyan(branchName)}.`);
}
