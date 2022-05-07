import { TRepoSyncStackFrame } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
import {
  currentBranchPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../../lib/preconditions';
import { syncPRInfoForBranches } from '../../lib/sync/pr_info';
import { checkoutBranch } from '../../lib/utils/checkout_branch';
import { logInfo } from '../../lib/utils/splog';
import { getTrunk } from '../../lib/utils/trunk';
import { Branch } from '../../wrapper-classes/branch';
import { deleteMergedBranches } from '../clean_branches';
import { fixDanglingBranches } from '../fix_dangling_branches';
import { mergeDownstack } from './merge_downstack';
import { pruneRemoteBranchMetadata } from './prune_remote_branch_metadata';
import { pull } from './pull';
import { resubmitBranchesWithNewBases } from './resubmit_branches_with_new_bases';
type TSyncScope = { type: 'DOWNSTACK'; branchName: string } | { type: 'REPO' };
export async function syncAction(
  opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    resubmit: boolean;
    fixDanglingBranches: boolean;
    pruneRemoteMetadata: boolean;
  },
  scope: TSyncScope,
  context: TContext
): Promise<void> {
  uncommittedTrackedChangesPrecondition();
  const oldBranchName = currentBranchPrecondition(context).name;
  checkoutBranch(getTrunk(context).name, { quiet: true });

  if (opts.pull) {
    pull(context, oldBranchName);

    if (opts.pruneRemoteMetadata) {
      await pruneRemoteBranchMetadata(context, opts.force);
    }

    if (
      scope.type === 'DOWNSTACK' &&
      (await mergeDownstack(scope.branchName, context)) === 'ABORT'
    ) {
      logInfo('Aborting...');
      return;
    }
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
    await deleteMergedBranches(
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

  await repoSyncDeleteMergedBranchesContinuation(
    deleteMergedBranchesContinuation,
    context
  );
}

export async function repoSyncDeleteMergedBranchesContinuation(
  frame: TRepoSyncStackFrame,
  context: TContext
): Promise<void> {
  if (frame.resubmit) {
    await resubmitBranchesWithNewBases(frame.force, context);
  }

  checkoutBranch(
    Branch.exists(frame.oldBranchName)
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
    if (!Branch.exists(ref._branchName)) {
      logDebug(`Deleting metadata for ${ref._branchName}`);
      ref.delete();
    }
  });
}
*/
