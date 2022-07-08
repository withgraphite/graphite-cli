import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitFailedError, KilledError } from '../lib/errors';
import { checkoutBranch } from './checkout_branch';

export async function trackBranchInteractive(
  context: TContext
): Promise<boolean> {
  const parentBranchName = context.metaCache.currentBranchPrecondition;
  const choices = context.metaCache.allBranchNames
    .filter(
      (branchName) =>
        !context.metaCache.isTrunk(branchName) &&
        !context.metaCache.isBranchTracked(branchName) &&
        (context.metaCache.isTrunk(parentBranchName) ||
          context.metaCache.isDescendantOf(branchName, parentBranchName))
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

  trackHelper({ branchName, parentBranchName }, context);
  await checkoutBranch(branchName, context);
  return true;
}

function getPotentialParents(
  args: {
    branchName: string;
    onlyTrackedParents: boolean;
  },
  context: TContext
): { title: string; value: string }[] {
  return context.metaCache.allBranchNames
    .filter(
      (potentialParentBranchName) =>
        context.metaCache.isTrunk(potentialParentBranchName) ||
        ((!args.onlyTrackedParents ||
          context.metaCache.isBranchTracked(potentialParentBranchName)) &&
          context.metaCache.isDescendantOf(
            args.branchName,
            potentialParentBranchName
          ))
    )
    .sort((left, right) => {
      return left === right
        ? 0
        : context.metaCache.isTrunk(right) ||
          context.metaCache.isDescendantOf(left, right)
        ? -1 // left is a descendant of right
        : 1; // left is not a descendant of right
    })
    .map((b) => {
      return { title: b, value: b };
    });
}

export async function trackStack(
  args: {
    branchName?: string;
    force: boolean;
  },
  context: TContext
): Promise<void> {
  const force = args.force || !context.interactive;
  const branchName = args.branchName ?? context.metaCache.currentBranch;

  if (!context.metaCache.branchExists(branchName)) {
    throw new ExitFailedError(`No branch found.`);
  }

  if (
    context.metaCache.isTrunk(branchName) ||
    context.metaCache.isBranchTracked(branchName)
  ) {
    context.splog.info(`${chalk.cyan(branchName)} is already tracked!`);
    return;
  }
  context.splog.debug(`Tracking ${branchName}`);

  const choices = getPotentialParents(
    { branchName, onlyTrackedParents: false },
    context
  );

  if (choices.length === 0) {
    throw new ExitFailedError(
      `No possible parents for this branch. Try running \`git rebase ${context.metaCache.trunk} ${branchName}\``
    );
  }

  const parentBranchName =
    choices.length === 1 || force
      ? choices[0].value
      : (
          await prompts(
            {
              type: 'autocomplete',
              name: 'branch',
              message: `Select a parent for ${branchName} (autocomplete or arrow keys)`,
              choices,
              suggest: (input, choices) =>
                choices.filter((c: { value: string }) =>
                  c.value.includes(input)
                ),
            },
            {
              onCancel: () => {
                throw new KilledError();
              },
            }
          )
        ).branch;

  await trackStack({ branchName: parentBranchName, force }, context);
  trackHelper({ branchName, parentBranchName }, context);
}

export async function trackBranch(
  args: {
    branchName: string | undefined;
    parentBranchName: string | undefined;
    force: boolean;
  },
  context: TContext
): Promise<void> {
  const branchName = args.branchName ?? context.metaCache.currentBranch;
  if (!context.metaCache.branchExists(branchName)) {
    throw new ExitFailedError(`No branch found.`);
  }

  if (args.force || !args.parentBranchName) {
    const choices = getPotentialParents(
      { branchName, onlyTrackedParents: true },
      context
    );

    if (choices.length === 0) {
      throw new ExitFailedError(
        `No possible parents for this branch. Try running \`git rebase ${context.metaCache.trunk} ${branchName}\``
      );
    }

    if (args.force || choices.length === 1) {
      trackHelper({ branchName, parentBranchName: choices[0].value }, context);
      return;
    }

    if (!context.interactive) {
      throw new ExitFailedError(
        `Multiple possible parents; cannot prompt in non-interactive mode.`
      );
    }

    trackHelper(
      {
        branchName,
        parentBranchName: (
          await prompts(
            {
              type: 'autocomplete',
              name: 'branch',
              message: `Select a parent for ${branchName} (autocomplete or arrow keys)`,
              choices,
              suggest: (input, choices) =>
                choices.filter((c: { value: string }) =>
                  c.value.includes(input)
                ),
            },
            {
              onCancel: () => {
                throw new KilledError();
              },
            }
          )
        ).branch,
      },
      context
    );
    return;
  }

  if (
    !context.metaCache.isTrunk(args.parentBranchName) &&
    !context.metaCache.isDescendantOf(branchName, args.parentBranchName)
  ) {
    context.splog.tip(
      `Are you sure that ${chalk.cyan(
        args.parentBranchName
      )} is the right parent for ${chalk.cyan(
        branchName
      )}?  If so, you can fix its history with ${chalk.cyan(
        `git rebase ${args.parentBranchName} ${branchName}`
      )} and then try again.`
    );

    throw new ExitFailedError(
      `${chalk.yellow(
        args.parentBranchName
      )} is not in the history of ${chalk.yellow(branchName)}.`
    );
  }

  trackHelper({ branchName, parentBranchName: args.parentBranchName }, context);
}

function trackHelper(
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
  context.splog.info(
    `Tracked branch ${chalk.green(branchName)} with parent ${chalk.cyan(
      parentBranchName
    )}.`
  );
}
