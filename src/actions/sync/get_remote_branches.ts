import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { ExitFailedError, KilledError } from '../../lib/errors';
import { assertUnreachable } from '../../lib/utils/assert_unreachable';
import { persistContinuation } from '../restack';

export async function getBranchesFromRemote(
  downstack: string[],
  base: string,
  context: TContext
): Promise<void> {
  let parentBranchName = base;
  for (const branchName of downstack) {
    const fetchResult = context.metaCache.fetchBranch(
      branchName,
      parentBranchName
    );
    switch (fetchResult) {
      case 'DOES_NOT_EXIST':
        context.metaCache.overwriteBranchFromFetched(
          branchName,
          parentBranchName
        );
        context.splog.logInfo(`Synced ${chalk.cyan(branchName)} from remote.`);
        break;
      case 'EXISTS_DIFFERENT_PARENTS':
        await handleDifferentParents(branchName, parentBranchName, context);
        break;
      case 'EXISTS_SAME_PARENT':
        await handleSameParent(branchName, parentBranchName, context);
        break;
      default:
        assertUnreachable(fetchResult);
        break;
    }
    parentBranchName = branchName;
  }
}

async function handleDifferentParents(
  branchName: string,
  parentBranchName: string,
  context: TContext
): Promise<void> {
  context.splog.logInfo(
    [
      `${chalk.yellow(
        branchName
      )} shares a name with a local branch, but they have different parents.`,
      `In order to sync it, you must overwrite your local copy of the branch.`,
      `If you do not wish to overwrite your copy, the command will be aborted.`,
    ].join('\n')
  );

  if (
    !context.interactive ||
    !(
      await prompts(
        {
          type: 'confirm',
          name: 'value',
          message: `Overwrite ${chalk.yellow(
            branchName
          )} with the version from remote?`,
          initial: false,
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      )
    ).value
  ) {
    throw new ExitFailedError(`Aborted.`);
  }

  context.metaCache.overwriteBranchFromFetched(branchName, parentBranchName);
  context.splog.logInfo(`Synced ${chalk.cyan(branchName)} from remote.`);
}

async function handleSameParent(
  branchName: string,
  parentBranchName: string,
  context: TContext
): Promise<void> {
  if (context.metaCache.isBranchUpToDateWithFetched(branchName)) {
    context.splog.logInfo(`${chalk.cyan(branchName)} is up to date.`);
    return;
  }

  context.splog.logInfo(
    [
      `${chalk.yellow(
        branchName
      )} shares a name with a local branch, and they have the same parent.`,
      `You can either overwrite your copy of the branch, or rebase your local changes onto the remote version.`,
      `You can also abort the command entirely and keep your local state as is.`,
    ].join('\n')
  );

  const fetchChoice: 'REBASE' | 'OVERWRITE' | 'ABORT' = !context.interactive
    ? 'ABORT'
    : (
        await prompts(
          {
            type: 'select',
            name: 'value',
            message: `How would you like to handle ${chalk.yellow(
              branchName
            )}?`,
            choices: [
              {
                title: 'Rebase your changes on top of the remote version',
                value: 'REBASE',
              },
              {
                title: 'Overwrite the local copy with the remote version',
                value: 'OVERWRITE',
              },
              { title: 'Abort this command', value: 'ABORT' },
            ],
            initial: 'REBASE',
          },
          {
            onCancel: () => {
              throw new KilledError();
            },
          }
        )
      ).value;

  switch (fetchChoice) {
    case 'REBASE':
      if (
        context.metaCache.rebaseLocalChangesOnFetched(
          branchName,
          parentBranchName
        ) === 'REBASE_CONFLICT'
      ) {
        persistContinuation(
          {context.metaCache.getRelativeStack(
            currentBranchName,
            SCOPE.UPSTACK_EXCLUSIVE
          )},
          context
        );
        throw new RebaseConflictError(
          `Hit conflict during interactive rebase of ${chalk.yellow(
            currentBranchName
          )}.`
        );
      }

    case 'OVERWRITE':
      context.metaCache.overwriteBranchFromFetched(
        branchName,
        parentBranchName
      );
      break;
    case 'ABORT':
      throw new ExitFailedError(`Aborted.`);
    default:
      assertUnreachable(fetchChoice);
  }
}
