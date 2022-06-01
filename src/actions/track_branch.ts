import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitFailedError, KilledError } from '../lib/errors';

export async function trackBranch(
  {
    branchName,
    parentBranchName,
    force,
  }: { branchName: string; parentBranchName: string; force: boolean },
  context: TContext
): Promise<void> {
  if (!context.metaCache.branchExists(branchName)) {
    throw new ExitFailedError(
      `Branch ${chalk.yellow(branchName)} does not exist.`
    );
  }

  if (context.metaCache.isTrunk(branchName)) {
    throw new ExitFailedError(
      `${chalk.yellow(
        branchName
      )} is designated as trunk. To change your configured trunk branch, use ${chalk.cyan(
        `gt repo init`
      )}.`
    );
  }

  if (
    context.metaCache.isBranchTracked(branchName) &&
    !(await shouldRetrackBranch(
      { branchName, parentBranchName, force },
      context
    ))
  ) {
    return;
  }

  if (
    context.metaCache.trackBranch(branchName, parentBranchName) ===
    'NEEDS_REBASE'
  ) {
    context.splog.logTip(
      `Are you sure that ${chalk.cyan(
        parentBranchName
      )} is the right parent for ${chalk.cyan(
        branchName
      )}?  If so, you can fix its history with ${chalk.cyan(
        `git rebase ${parentBranchName} ${branchName}`
      )} and then try again.`
    );

    throw new ExitFailedError(
      `${chalk.yellow(
        parentBranchName
      )} is not in the history of ${chalk.yellow(branchName)}.`
    );
  }

  context.metaCache.checkoutBranch(branchName);
  context.splog.logInfo(
    `Checked out newly tracked branch ${chalk.green(
      branchName
    )} with parent ${chalk.cyan(parentBranchName)}.`
  );
}

async function shouldRetrackBranch(
  {
    branchName,
    parentBranchName,
    force,
  }: { branchName: string; parentBranchName: string; force: boolean },
  context: TContext
): Promise<boolean> {
  context.splog.logInfo(`Already tracking ${chalk.yellow(branchName)}.`);
  if (
    parentBranchName === context.metaCache.getParentPrecondition(branchName)
  ) {
    context.splog.logInfo(
      `Parent is already set to ${chalk.cyan(parentBranchName)}.`
    );
    return false;
  }

  context.splog.logWarn(
    `This operation may result in a duplicated commit history.`
  );
  context.splog.logTip(`Did you mean to use ${chalk.cyan(`gt upstack onto`)}?`);

  return (
    force ||
    (context.interactive &&
      (
        await prompts(
          {
            type: 'confirm',
            name: 'value',
            message: `Are you sure that you'd like to change its parent to ${chalk.yellow(
              parentBranchName
            )}?`,
            initial: false,
          },
          {
            onCancel: () => {
              throw new KilledError();
            },
          }
        )
      ).value)
  );
}
