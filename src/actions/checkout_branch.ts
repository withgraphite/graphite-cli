import chalk from 'chalk';
import { TContext } from '../lib/context';
import { interactiveBranchSelection } from './log';

export async function checkoutBranch(
  branchName: string | undefined,
  context: TContext
): Promise<void> {
  if (!branchName) {
    branchName = await interactiveBranchSelection(
      {
        message: 'Checkout a branch (autocomplete or arrow keys)',
      },
      context
    );
  }
  if (branchName === context.metaCache.currentBranch) {
    context.splog.info(`Already on ${chalk.cyan(branchName)}.`);
    return;
  }
  context.metaCache.checkoutBranch(branchName);
  context.splog.info(`Checked out ${chalk.cyan(branchName)}.`);
}
