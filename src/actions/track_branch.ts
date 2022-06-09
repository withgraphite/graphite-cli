import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitFailedError, KilledError } from '../lib/errors';

export async function trackBranchInteractive(
  parentBranchName: string,
  context: TContext
): Promise<boolean> {
  if (!context.interactive) {
    throw new ExitFailedError(
      'Must provide a branch to track in non-interactive mode.'
    );
  }

  const choices = context.metaCache.allBranchNames
    .filter(
      (branchName) =>
        !context.metaCache.isBranchTracked(branchName) &&
        context.metaCache.canTrackBranch(branchName, parentBranchName)
    )
    .map((branchName) => ({ title: branchName, value: branchName }));

  if (!choices.length) {
    context.splog.info(
      `No branches available to track as children of ${chalk.blueBright(
        parentBranchName
      )}!`
    );
    return false;
  }

  const branchName = (
    await prompts(
      {
        type: 'autocomplete',
        name: 'value',
        message: `Enter a branch to track as a child of ${parentBranchName} (autocomplete or arrow keys)`,
        choices,
        suggest: (input, choices) =>
          choices.filter((c: { value: string }) => c.value.includes(input)),
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    )
  ).value;

  if (!branchName) {
    throw new KilledError();
  }

  trackBranchInternal({ branchName, parentBranchName }, context);
  return true;
}
export async function trackBranch(
  {
    branchName,
    parentBranchName,
    force,
  }: {
    branchName: string;
    parentBranchName: string;
    force?: boolean;
  },
  context: TContext
): Promise<void> {
  if (
    branchName &&
    !(await shouldTrackBranch({ branchName, parentBranchName, force }, context))
  ) {
    return;
  }
  trackBranchInternal({ branchName, parentBranchName }, context);
}

function trackBranchInternal(
  {
    branchName,
    parentBranchName,
  }: {
    branchName: string;
    parentBranchName: string;
  },
  context: TContext
) {
  context.metaCache.trackBranch(branchName, parentBranchName);
  context.metaCache.checkoutBranch(branchName);
  context.splog.info(
    `Checked out newly tracked branch ${chalk.green(
      branchName
    )} with parent ${chalk.cyan(parentBranchName)}.`
  );
  return true;
}

async function shouldTrackBranch(
  {
    branchName,
    parentBranchName,
    force,
  }: {
    branchName: string;
    parentBranchName: string;
    force?: boolean;
  },
  context: TContext
): Promise<boolean> {
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
    return false;
  }

  if (!context.metaCache.canTrackBranch(branchName, parentBranchName)) {
    context.splog.tip(
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

  return true;
}

async function shouldRetrackBranch(
  {
    branchName,
    parentBranchName,
    force,
  }: { branchName: string; parentBranchName: string; force?: boolean },
  context: TContext
): Promise<boolean> {
  context.splog.info(`Already tracking ${chalk.yellow(branchName)}.`);
  if (
    parentBranchName === context.metaCache.getParentPrecondition(branchName)
  ) {
    context.splog.info(
      `Parent is already set to ${chalk.cyan(parentBranchName)}.`
    );
    return false;
  }

  context.splog.warn(
    `This operation may result in a duplicated commit history.`
  );
  context.splog.tip('Did you mean to use `gt upstack onto`?');

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
