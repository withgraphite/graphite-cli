import { TContext } from '../../lib/context';
import { uncommittedTrackedChangesPrecondition } from '../../lib/preconditions';
import { SCOPE } from '../../lib/state/scope_spec';
import { syncPRInfoForBranches } from '../../lib/sync/pr_info';
import { cleanBranches as cleanBranches } from '../clean_branches';
import { restackBranches } from '../restack';
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

  await syncPRInfoForBranches(context.metaCache.allBranchNames, context);

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
