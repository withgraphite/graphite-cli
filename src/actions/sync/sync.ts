import chalk from 'chalk';
import { getDownstackDependencies } from '../../lib/api/get_downstack_dependencies';
import { TContext } from '../../lib/context';
import { SCOPE } from '../../lib/engine/scope_spec';
import { ExitFailedError } from '../../lib/errors';
import {
  cliAuthPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../../lib/preconditions';
import { cleanBranches } from '../clean_branches';
import { restackBranches } from '../restack';
import { syncPrInfo } from '../sync_pr_info';
import { getBranchesFromRemote } from './get_remote_branches';

export async function syncAction(
  opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
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
          ? `${chalk.green(context.metaCache.trunk)} is up to date.`
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
    restackBranches({ relative: false, branchNames: downstackToSync }, context);
  }

  await syncPrInfo(context.metaCache.allBranchNames, context);

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

    restackBranches(
      {
        relative: false,
        branchNames: branchesWithNewParents.flatMap((branchName) =>
          context.metaCache.getRelativeStack(branchName, SCOPE.UPSTACK)
        ),
      },
      context
    );
  }
}
