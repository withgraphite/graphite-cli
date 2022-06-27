import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitFailedError, KilledError } from '../lib/errors';

export async function untrackBranch(
  { branchName, force }: { branchName: string; force: boolean },
  context: TContext
): Promise<void> {
  if (!context.metaCache.branchExists(branchName)) {
    throw new ExitFailedError(
      `Branch ${chalk.yellow(branchName)} does not exist.`
    );
  }

  if (context.metaCache.isTrunk(branchName)) {
    throw new ExitFailedError(`Can't untrack trunk!`);
  }

  if (!context.metaCache.isBranchTracked(branchName)) {
    context.splog.info(
      `Branch ${chalk.yellow(branchName)} is not tracked by Graphite.`
    );
    return;
  }

  const children = context.metaCache.getChildren(branchName);
  if (children.length) {
    context.splog.tip(
      'If you would like to keep these branches tracked, use `upstack onto` to change their parent before untracking.'
    );
    if (
      !(await shouldUntrackBranchWithChildren(
        { branchName, children, force },
        context
      ))
    ) {
      return;
    }
  }

  context.metaCache.untrackBranch(branchName);
  context.splog.info(`Untracked branch ${chalk.yellow(branchName)}.`);
}

async function shouldUntrackBranchWithChildren(
  {
    branchName,
    children,
    force,
  }: { branchName: string; children: string[]; force: boolean },
  context: TContext
): Promise<boolean> {
  context.splog.info(
    `${chalk.yellow(branchName)} has tracked children:\n${children
      .map((child) => `▸ ${child}`)
      .join('\n')}`
  );

  return (
    force ||
    (context.interactive &&
      (
        await prompts(
          {
            type: 'confirm',
            name: 'value',
            message: `Are you sure you want to untrack ${chalk.yellow(
              branchName
            )} and all of its upstack branches?`,
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
