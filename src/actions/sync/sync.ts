import { TContext } from '../../lib/context';
import { SCOPE } from '../../lib/engine/scope_spec';
import { uncommittedTrackedChangesPrecondition } from '../../lib/preconditions';
import { cleanBranches as cleanBranches } from '../clean_branches';
import { restackBranches } from '../restack';
import { syncPrInfo } from '../sync_pr_info';
import { mergeDownstack } from './merge_downstack';
import { pull } from './pull';

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
    context.splog.logInfo(`Pulling in new changes...`);
    context.splog.logTip(
      `Disable this behavior at any point in the future with --no-pull`
    );
    pull([context.metaCache.trunk].concat(opts.downstackToSync ?? []), context);
    context.splog.logNewline();
  }

  if (opts.downstackToSync) {
    await mergeDownstack(opts.downstackToSync, context);
  }

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
