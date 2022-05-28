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
import { fixDanglingBranches } from '../fix_dangling_branches';
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
    fixDanglingBranches: boolean;
    downstackToSync?: string[];
  },
  context: TContext
): Promise<void> {
  uncommittedTrackedChangesPrecondition();
  const oldBranchName = currentBranchPrecondition(context).name;
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

  // This needs to happen before we delete/resubmit so that we can potentially
  // delete or resubmit on the dangling branches.
  if (opts.fixDanglingBranches) {
    await fixDanglingBranches(context, {
      force: opts.force,
      showSyncTip: true,
    });
  }

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

/**
 *
 * Remove for now - users are reporting issues where this is incorrectly
 * deleting metadata for still-existing branches.
 *
 * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1632897956089100
 * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1634168133170500
 *
function cleanDanglingMetadata(): void {
  const allMetadataRefs = MetadataRef.allMetadataRefs();
  allMetadataRefs.forEach((ref) => {
    if (!branchExists(ref._branchName)) {
      context.splog.logDebug(`Deleting metadata for ${ref._branchName}`);
      ref.delete();
    }
  });
}
*/
