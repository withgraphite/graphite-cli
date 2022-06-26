import chalk from 'chalk';
import prompts from 'prompts';
import { getDownstackDependencies } from '../../lib/api/get_downstack_dependencies';
import { TContext } from '../../lib/context';
import {
  ExitFailedError,
  KilledError,
  RebaseConflictError,
} from '../../lib/errors';
import {
  cliAuthPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../../lib/preconditions';
import { assertUnreachable } from '../../lib/utils/assert_unreachable';
import { persistContinuation } from '../persist_continuation';
import { printConflictStatus } from '../print_conflict_status';
import { syncPrInfo } from '../sync_pr_info';

export async function getAction(
  branchName: string,
  context: TContext
): Promise<void> {
  uncommittedTrackedChangesPrecondition();
  context.splog.info(
    `Pulling ${chalk.cyan(context.metaCache.trunk)} from remote...`
  );

  try {
    context.splog.info(
      context.metaCache.pullTrunk() === 'PULL_UNNEEDED'
        ? `${chalk.green(context.metaCache.trunk)} is up to date.`
        : `${chalk.green(
            context.metaCache.trunk
          )} fast-forwarded to ${chalk.gray(
            context.metaCache.getRevision(context.metaCache.trunk)
          )}.`
    );
    context.splog.newline();
  } catch (err) {
    throw new ExitFailedError(`Failed to pull trunk`, err);
  }

  const authToken = cliAuthPrecondition(context);
  const downstackToSync = await getDownstackDependencies(
    { branchName, trunkName: context.metaCache.trunk },
    {
      authToken,
      repoName: context.repoConfig.getRepoName(),
      repoOwner: context.repoConfig.getRepoOwner(),
    }
  );

  await getBranchesFromRemote(
    downstackToSync,
    context.metaCache.trunk,
    context
  );

  await syncPrInfo(context.metaCache.allBranchNames, context);
}

export async function getBranchesFromRemote(
  downstack: string[],
  base: string,
  context: TContext
): Promise<void> {
  let parentBranchName = base;
  for (const [index, branchName] of downstack.entries()) {
    context.metaCache.fetchBranch(branchName, parentBranchName);
    if (!context.metaCache.branchExists(branchName)) {
      // If the branch doesn't already exists, no conflict to resolve
      context.metaCache.checkoutBranchFromFetched(branchName, parentBranchName);
      context.splog.info(`Synced ${chalk.cyan(branchName)} from remote.`);
    } else if (!context.metaCache.isBranchTracked(branchName)) {
      await handleUntrackedLocally(branchName, parentBranchName, context);
    } else if (
      context.metaCache.getParentPrecondition(branchName) !== parentBranchName
    ) {
      await handleDifferentParents(branchName, parentBranchName, context);
    } else if (context.metaCache.branchMatchesFetched(branchName)) {
      context.splog.info(`${chalk.cyan(branchName)} is up to date.`);
    } else {
      const remainingBranchesToSync = downstack.slice(index + 1);
      await handleSameParent(
        { branchName, parentBranchName, remainingBranchesToSync },
        context
      );
    }
    parentBranchName = branchName;
  }
}

async function handleUntrackedLocally(
  branchName: string,
  parentBranchName: string,
  context: TContext
): Promise<void> {
  context.splog.info(
    [
      `${chalk.yellow(
        branchName
      )} shares a name with a local branch that not tracked by Graphite.`,
      `In order to sync it, you must overwrite your local copy of the branch.`,
      `If you do not wish to overwrite your copy, the command will be aborted.`,
    ].join('\n')
  );
  await maybeOverwriteBranch(branchName, parentBranchName, context);
}

async function handleDifferentParents(
  branchName: string,
  parentBranchName: string,
  context: TContext
): Promise<void> {
  context.splog.info(
    [
      `${chalk.yellow(
        branchName
      )} shares a name with a local branch, but they have different parents.`,
      `In order to sync it, you must overwrite your local copy of the branch.`,
      `If you do not wish to overwrite your copy, the command will be aborted.`,
    ].join('\n')
  );
  await maybeOverwriteBranch(branchName, parentBranchName, context);
}

// Helper function for cases where we can either overwrite local or abort
async function maybeOverwriteBranch(
  branchName: string,
  parentBranchName: string,
  context: TContext
) {
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
    throw new KilledError();
  }

  context.metaCache.checkoutBranchFromFetched(branchName, parentBranchName);
  context.splog.info(`Synced ${chalk.cyan(branchName)} from remote.`);
}

// This is the most complex case - if the branch's parent matches meta,
// we need to not only allow for overwrite and abort, but also rebasing
// local changes onto the changes from remote.
async function handleSameParent(
  args: {
    branchName: string;
    parentBranchName: string;
    remainingBranchesToSync: string[];
  },
  context: TContext
): Promise<void> {
  context.splog.info(
    [
      `${chalk.yellow(
        args.branchName
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
              args.branchName
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
          },
          {
            onCancel: () => {
              throw new KilledError();
            },
          }
        )
      ).value;

  switch (fetchChoice) {
    case 'REBASE': {
      const result = context.metaCache.rebaseBranchOntoFetched(
        args.branchName,
        args.parentBranchName
      );
      if (result.result === 'REBASE_CONFLICT') {
        persistContinuation(
          {
            branchesToSync: args.remainingBranchesToSync,
            rebasedBranchBase: result.rebasedBranchBase,
          },
          context
        );
        printConflictStatus(
          `Hit conflict rebasing ${chalk.yellow(
            args.branchName
          )} onto remote source of truth.`,
          context
        );
        throw new RebaseConflictError();
      }
      context.splog.info(
        `Rebased local changes to ${chalk.cyan(
          args.branchName
        )} onto remote source of truth.`
      );
      context.splog.tip(
        `If this branch has local children, they likely need to be restacked.`
      );
      break;
    }
    case 'OVERWRITE':
      context.metaCache.checkoutBranchFromFetched(
        args.branchName,
        args.parentBranchName
      );
      context.splog.info(`Synced ${chalk.cyan(args.branchName)} from remote.`);
      break;
    case 'ABORT':
      throw new KilledError();
    default:
      assertUnreachable(fetchChoice);
  }
}
