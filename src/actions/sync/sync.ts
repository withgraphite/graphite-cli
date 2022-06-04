import chalk from 'chalk';
import { getDownstackDependencies } from '../../lib/api/get_downstack_dependencies';
import { TContext } from '../../lib/context';
import { SCOPE } from '../../lib/engine/scope_spec';
import { ExitFailedError } from '../../lib/errors';
import {
  cliAuthPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../../lib/preconditions';
import { restackBranches } from '../restack';
import { syncPrInfo } from '../sync_pr_info';
import { cleanBranches as cleanBranches } from './clean_branches';
import { getBranchesFromRemote } from './get_remote_branches';

// Why can we use a Set to keep track of branches to restack?
// We have three different sources for branches that could
// need restacking: (of course, we currently don't have a
// command that results in both 2. and 3.)
//
// 1. The current stack
// 2. The full stack of the synced downstack.
// 3. The upstack of any branches whose parent was deleted.
//
// Since we only delete ranges of branches from trunk, 3.
// are actually also full stacks, which means we can add
// these groups to the set in any order (as long as the
// stacks themselves are ordered correctly, which they
// will be) and we will have a topologically sorted list
// of branches to restack.
//
// We end up not adding 1. until the end in case some of
// its branches are deleted by the cleanBranches() step.

export async function syncAction(
  opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    restackCurrentStack: boolean;
    tipOfDownstack?: string;
  },
  context: TContext
): Promise<void> {
  uncommittedTrackedChangesPrecondition();

  if (opts.pull) {
    context.splog.logInfo(
      `Pulling ${chalk.cyan(context.metaCache.trunk)} from remote...`
    );
    context.splog.logTip(`You can skip pulling trunk with the --no-pull flag.`);

    try {
      context.splog.logInfo(
        context.metaCache.pullTrunk() === 'PULL_UNNEEDED'
          ? `${chalk.cyan(context.metaCache.trunk)} is up to date.`
          : `${chalk.green(
              context.metaCache.trunk
            )} fast-forwarded to ${chalk.gray(
              context.metaCache.getRevision(context.metaCache.trunk)
            )}.`
      );
      context.splog.logNewline();
    } catch (err) {
      throw new ExitFailedError(`Failed to pull trunk`, err);
    }
  }

  const branchesToRestack = new Set<string>();

  if (opts.tipOfDownstack) {
    const authToken = cliAuthPrecondition(context);
    const downstackToSync = await getDownstackDependencies(
      { branchName: opts.tipOfDownstack, trunkName: context.metaCache.trunk },
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

    // Since we may have rebased local copies of branches on their parents, we
    //  need to restack the stack to fully align inter-branch dependencies.
    context.metaCache
      .getRelativeStack(downstackToSync[0], SCOPE.UPSTACK)
      .forEach((branchName) => branchesToRestack.add(branchName));
  }

  await syncPrInfo(context.metaCache.allBranchNames, context);

  // Since this happens after the downstack sync, if we ever decide to allow
  // both actions in the same command, we can maybe add deletion as part of
  // of continue.  But I doubt we will want to go in that direction?
  if (opts.delete) {
    context.splog.logInfo(
      `Checking if any branches have been merged/closed and can be deleted...`
    );
    context.splog.logTip(
      `You can skip deleting branches with the --no-delete flag.`
    );
    const branchesWithNewParents = await cleanBranches(
      { showDeleteProgress: opts.showDeleteProgress, force: opts.force },
      context
    );

    branchesWithNewParents
      .flatMap((branchName) =>
        context.metaCache.getRelativeStack(branchName, SCOPE.UPSTACK)
      )
      .forEach((branchName) => branchesToRestack.add(branchName));
  }

  const currentBranch = context.metaCache.currentBranch;
  if (
    opts.restackCurrentStack &&
    currentBranch &&
    context.metaCache.branchExists(currentBranch) &&
    context.metaCache.isBranchTracked(currentBranch)
  ) {
    context.metaCache
      .getRelativeStack(
        context.metaCache.currentBranchPrecondition,
        SCOPE.STACK
      )
      .forEach((branchName) => branchesToRestack.add(branchName));
  }

  restackBranches(
    {
      relative: false,
      branchNames: [...branchesToRestack],
    },
    context
  );
}
