import chalk from 'chalk';
import { TContext } from '../../lib/context';
import { SCOPE } from '../../lib/engine/scope_spec';
import { ExitFailedError } from '../../lib/errors';
import { uncommittedTrackedChangesPrecondition } from '../../lib/preconditions';
import { restackBranches } from '../restack';
import { syncPrInfo } from '../sync_pr_info';
import { cleanBranches } from './clean_branches';

export async function syncAction(
  opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    restack: boolean;
  },
  context: TContext
): Promise<void> {
  uncommittedTrackedChangesPrecondition();

  if (opts.pull) {
    pullTrunk(context);
    context.splog.logTip(
      'You can skip pulling trunk with the `--no-pull` flag.'
    );
  }

  const branchesToRestack: string[] = [];

  await syncPrInfo(context.metaCache.allBranchNames, context);

  if (opts.delete) {
    context.splog.logInfo(
      `Checking if any branches have been merged/closed and can be deleted...`
    );
    const branchesWithNewParents = await cleanBranches(
      { showDeleteProgress: opts.showDeleteProgress, force: opts.force },
      context
    );
    context.splog.logTip(
      'You can skip deleting branches with the `--no-delete` flag.'
    );
    if (!opts.restack) {
      return;
    }

    branchesWithNewParents
      .flatMap((branchName) =>
        context.metaCache.getRelativeStack(branchName, SCOPE.UPSTACK)
      )
      .forEach((branchName) => branchesToRestack.push(branchName));
  }
  if (!opts.restack) {
    return;
  }

  const currentBranch = context.metaCache.currentBranch;
  if (
    currentBranch &&
    context.metaCache.branchExists(currentBranch) &&
    context.metaCache.isBranchTracked(currentBranch) &&
    !branchesToRestack.includes(currentBranch)
  ) {
    context.metaCache
      .getRelativeStack(currentBranch, SCOPE.STACK)
      .forEach((branchName) => branchesToRestack.push(branchName));
  }

  restackBranches({ relative: false, branchNames: branchesToRestack }, context);
}

export function pullTrunk(context: TContext): void {
  context.splog.logInfo(
    `Pulling ${chalk.cyan(context.metaCache.trunk)} from remote...`
  );

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
  } catch (err) {
    throw new ExitFailedError(`Failed to pull trunk`, err);
  }
}
