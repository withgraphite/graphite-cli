import { TRepoSyncStackFrame } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context';
import { branchExists } from '../../lib/git/branch_exists';
import { checkoutBranch } from '../../lib/git/checkout_branch';
import {
  currentBranchPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../../lib/preconditions';
import { syncPRInfoForBranches } from '../../lib/sync/pr_info';
import { getTrunk } from '../../lib/utils/trunk';
import { Branch } from '../../wrapper-classes/branch';
import { cleanBranches as cleanBranches } from '../clean_branches';
import { mergeDownstack } from './merge_downstack';
import { pull } from './pull';
import { resubmitBranchesWithNewBases } from './resubmit_branches_with_new_bases';
export async function syncAction(
  opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    resubmit: boolean;
    downstackToSync?: string[];
  },
  context: TContext
): Promise<void> {
  uncommittedTrackedChangesPrecondition();
  const oldBranchName = currentBranchPrecondition().name;
  checkoutBranch(getTrunk(context).name, { quiet: true });

  if (opts.pull) {
    pull(
      {
        oldBranchName,
        branchesToFetch: Branch.allBranches(context)
          .map((b) => b.name)
          .concat(opts.downstackToSync ?? []),
      },
      context
    );
  }

  if (opts.downstackToSync) {
    await mergeDownstack(opts.downstackToSync, context);
  }

  await syncPRInfoForBranches(Branch.allBranches(context), context);

  const deleteMergedBranchesContinuation = {
    op: 'REPO_SYNC_CONTINUATION' as const,
    force: opts.force,
    resubmit: opts.resubmit,
    oldBranchName: oldBranchName,
  };

  if (opts.delete) {
    await cleanBranches(
      {
        frame: {
          op: 'DELETE_BRANCHES_CONTINUATION',
          force: opts.force,
          showDeleteProgress: opts.showDeleteProgress,
        },
        parent: [deleteMergedBranchesContinuation],
        showSyncTip: true,
      },
      context
    );
  }

  await cleanBranchesContinuation(deleteMergedBranchesContinuation, context);
}

export async function cleanBranchesContinuation(
  frame: TRepoSyncStackFrame,
  context: TContext
): Promise<void> {
  if (frame.resubmit) {
    await resubmitBranchesWithNewBases(frame.force, context);
  }

  checkoutBranch(
    branchExists(frame.oldBranchName)
      ? frame.oldBranchName
      : getTrunk(context).name,
    { quiet: true }
  );
}
