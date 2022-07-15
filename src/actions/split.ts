import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { KilledError, PreconditionsFailedError } from '../lib/errors';
import { getUnstagedChanges } from '../lib/git/diff';
import { uncommittedTrackedChangesPrecondition } from '../lib/preconditions';
import { replaceUnsupportedCharacters } from '../lib/utils/branch_name';
import { restackBranches } from './restack';

export async function splitCurrentBranch(
  args: { style: 'hunk' | 'commit' | undefined },
  context: TContext
): Promise<void> {
  if (!context.interactive) {
    throw new PreconditionsFailedError(
      'This command must be run in interactive mode.'
    );
  }
  uncommittedTrackedChangesPrecondition();

  // If user did not select a style, prompt unless there is only one commit
  const style: 'hunk' | 'commit' | 'abort' =
    args.style ??
    (context.metaCache.getAllCommits(
      context.metaCache.currentBranchPrecondition,
      'SHA'
    ).length > 1
      ? (
          await prompts(
            {
              type: 'select',
              name: 'value',
              message: `How would you like to split ${context.metaCache.currentBranchPrecondition}?`,
              choices: [
                {
                  title: 'By commit - slice up the history of this branch.',
                  value: 'commit',
                },
                {
                  title: 'By hunk - split into new single-commit branches.',
                  value: 'hunk',
                },
                { title: 'Cancel this command (Ctrl+C).', value: 'abort' },
              ],
            },
            {
              onCancel: () => {
                throw new KilledError();
              },
            }
          )
        ).value
      : 'hunk');

  const actions = {
    commit: (context: TContext) => {
      void context;
    },
    hunk: splitByHunk,
    abort: () => {
      throw new KilledError();
    },
  };

  await actions[style](context);
}

async function splitByHunk(context: TContext): Promise<void> {
  const branchToSplit = context.metaCache.currentBranchPrecondition;
  const branchesToRestack = context.metaCache.getRelativeStack(
    branchToSplit,
    SCOPE.UPSTACK_EXCLUSIVE
  );
  const defaultCommitMessage = context.metaCache
    .getAllCommits(branchToSplit, 'MESSAGE')
    .reverse()
    .join('\n\n');

  const branchNames: string[] = [];
  context.metaCache.startSplit();

  const instructions = [
    `Splitting ${chalk.cyan(
      branchToSplit
    )} into multiple single-commit branches.`,
    ...(context.metaCache.getPrInfo(branchToSplit)?.number
      ? [
          `If any of the new branches keeps the name ${chalk.cyan(
            branchToSplit
          )}, it will be linked to #${
            context.metaCache.getPrInfo(branchToSplit)?.number
          }.`,
        ]
      : []),
    ``,
    chalk.yellow(`For each branch you'd like to create:`),
    `1. Pick a branch name.`,
    `2. Follow the prompts to stage the changes that you'd like to include.`,
    `3. Enter a commit message.`,
    `The command will continue until all changes have been added to a new branch.`,
  ].join('\n');

  try {
    for (
      let unstagedChanges = getUnstagedChanges();
      unstagedChanges.length > 0;
      unstagedChanges = getUnstagedChanges()
    ) {
      context.splog.info(instructions);
      context.splog.newline();
      context.splog.info(chalk.yellow('Remaining changes:'));
      context.splog.info(' ' + unstagedChanges);
      context.splog.newline();
      await createSplitCommit(
        { branchToSplit, branchNames, defaultCommitMessage },
        context
      );
      context.splog.newline();
    }
  } catch (e) {
    context.metaCache.handleSplitError(branchToSplit);
    context.splog.newline();
    context.splog.info(
      `Exited early: no new branches created. You are still on ${chalk.cyan(
        branchToSplit
      )}.`
    );
    throw e;
  }

  context.metaCache.finalizeSplit(branchToSplit, branchNames);

  restackBranches(branchesToRestack, context);
}

async function createSplitCommit(
  {
    branchToSplit,
    branchNames,
    defaultCommitMessage,
  }: {
    branchToSplit: string;
    branchNames: string[];
    defaultCommitMessage: string;
  },
  context: TContext
): Promise<void> {
  const { branchName } = await prompts(
    {
      type: 'text',
      name: 'branchName',
      message: 'Branch name',
      initial: getInitialBranchName(branchToSplit, branchNames),
      validate: (name) => {
        const calculatedName = replaceUnsupportedCharacters(name, context);
        return branchNames.includes(calculatedName) ||
          (calculatedName !== branchToSplit &&
            context.metaCache.allBranchNames.includes(calculatedName))
          ? 'Branch name is unavailable.'
          : true;
      },
    },
    {
      onCancel: () => {
        throw new KilledError();
      },
    }
  );
  branchNames.push(branchName);

  context.metaCache.commit({
    message: defaultCommitMessage,
    edit: true,
    patch: true,
  });
}

function getInitialBranchName(
  originalBranchName: string,
  branchNames: string[]
): string {
  return branchNames.includes(originalBranchName)
    ? getInitialBranchName(`${originalBranchName}_split`, branchNames)
    : originalBranchName;
}
