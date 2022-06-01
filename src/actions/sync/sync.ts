import chalk from 'chalk';
import { TContext } from '../../lib/context';
import { SCOPE } from '../../lib/engine/scope_spec';
import { ExitFailedError } from '../../lib/errors';
import { uncommittedTrackedChangesPrecondition } from '../../lib/preconditions';
import { cleanBranches as cleanBranches } from '../clean_branches';
import { restackBranches } from '../restack';
import { syncPrInfo } from '../sync_pr_info';

export async function syncAction(
  opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    downstackToSync?: string[];
  },
  context: TContext
): Promise<void> {
  uncommittedTrackedChangesPrecondition();
  if (opts.pull) {
    context.splog.logInfo(
      `Pulling ${chalk.cyan(context.metaCache.trunk)} from remote...`
    );
    context.splog.logTip(
      `Disable this behavior at any point in the future with --no-pull`
    );

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

  // TODO upstack PR will address this
  // if (opts.downstackToSync) {
  //     pull(opts.downstackToSync ?? []), context);

  //   await mergeDownstack(opts.downstackToSync, context);
  // }

  await syncPrInfo(context.metaCache.allBranchNames, context);

  if (opts.delete) {
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
