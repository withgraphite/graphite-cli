import chalk from 'chalk';
import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { interactiveBranchSelection } from './log';

export async function checkoutBranch(
  {
    branchName,
    showUntracked,
  }: {
    branchName: string | undefined;
    showUntracked?: boolean;
  },
  context: TContext
): Promise<void> {
  if (!branchName) {
    branchName = await interactiveBranchSelection(
      {
        message: 'Checkout a branch (autocomplete or arrow keys)',
        showUntracked,
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
  printBranchInfo(branchName, context);
}

function printBranchInfo(branchName: string, context: TContext) {
  if (
    !context.metaCache.isTrunk(branchName) &&
    !context.metaCache.isBranchTracked(branchName)
  ) {
    context.splog.info(`This branch is not tracked by Graphite.`);
  } else if (!context.metaCache.isBranchFixed(branchName)) {
    context.splog.info(
      `This branch has fallen behind ${chalk.blueBright(
        context.metaCache.getParentPrecondition(branchName)
      )} - you may want to ${chalk.cyan(`gt upstack restack`)}.`
    );
  } else {
    const nearestAncestorNeedingRestack = context.metaCache
      .getRelativeStack(branchName, SCOPE.DOWNSTACK)
      .reverse()
      .find((ancestor) => !context.metaCache.isBranchFixed(ancestor));

    if (nearestAncestorNeedingRestack) {
      context.splog.info(
        `The downstack branch ${chalk.cyan(
          nearestAncestorNeedingRestack
        )} has fallen behind ${chalk.blueBright(
          context.metaCache.getParentPrecondition(nearestAncestorNeedingRestack)
        )} - you may want to ${chalk.cyan(`gt stack restack`)}.`
      );
    }
  }
}
