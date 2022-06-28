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
        context.metaCache.isViableParent(branchName, parentBranchName)
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
  return true;
}
export async function trackBranch(
  args: {
    branchName: string | undefined;
    parentBranchName: string | undefined;
  },
  context: TContext
): Promise<void> {
  const branchName = args.branchName ?? context.metaCache.currentBranch;
  if (!context.metaCache.branchExists(branchName)) {
    throw new ExitFailedError(`No branch found.`);
  }

  if (!args.parentBranchName) {
    const choices = context.metaCache.allBranchNames
      .filter(
        (b) =>
          (context.metaCache.isTrunk(b) ||
            context.metaCache.isBranchTracked(b)) &&
          context.metaCache.isViableParent(branchName, b)
      )
      .map((b) => {
        return { title: b, value: b };
      });

    if (choices.length === 0) {
      throw new ExitFailedError(
        `No possible parents for this branch. Try running \`git rebase ${context.metaCache.trunk} ${branchName}\``
      );
    }

    if (choices.length === 1) {
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
          await prompts({
            type: 'autocomplete',
            name: 'branch',
            message: `Select a parent for ${branchName} (autocomplete or arrow keys)`,
            choices,
            suggest: (input, choices) =>
              choices.filter((c: { value: string }) => c.value.includes(input)),
          })
        ).branch,
      },
      context
    );
    return;
  }

  if (!context.metaCache.isViableParent(branchName, args.parentBranchName)) {
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
