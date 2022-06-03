import chalk from 'chalk';
import { getDownstackDependencies } from '../../lib/api/get_downstack_dependencies';
import { TContext } from '../../lib/context';
import { SCOPE } from '../../lib/engine/scope_spec';
import { ExitFailedError } from '../../lib/errors';
import {
  cliAuthPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../../lib/preconditions';
import { cleanBranches as cleanBranches } from '../clean_branches';
import { restackBranches } from '../restack';
import { syncPrInfo } from '../sync_pr_info';
import { getBranchesFromRemote } from './get_remote_branches';

// eslint-disable-next-line max-lines-per-function
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

  // Why can we use a Set to keep track of branches to restack?
  // We have three different sources for branches that could
  // need restacking:
  //
  // 1. The current stack
  // 2. The full stack of the synced downstack.
  // 3. The upstack of any branches whose parent was deleted.
  //
  // We want to:
  // - avoid trying to restack the same branch more than once
  // - ensure that branches are restacked in the correct order
  //   (always restack parents before children)
  //
  // Since the first 2 groups of branches are full stacks,
  // using a Set is perfectly fine for order, as any branch
  // whose parent needs to be restacked will be added before
  // it (as the metaCache always returns stacks topologically
  // sorted).
  //
  // I doubt we'll actually ever do all 3 of these in a single
  // command, but maybe we'll add a "true" repo sync option
  // some day? (where all downstacks are synced from remote)

  const currentBranch = context.metaCache.currentBranch;
  const branchesToRestack = new Set(
    opts.restackCurrentStack &&
    currentBranch &&
    context.metaCache.branchExists(currentBranch) &&
    context.metaCache.isBranchTracked(currentBranch)
      ? context.metaCache.getRelativeStack(
          context.metaCache.currentBranchPrecondition,
          SCOPE.STACK
        )
      : []
  );

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

  restackBranches(
    {
      relative: false,
      branchNames: [...branchesToRestack],
    },
    context
  );
}
