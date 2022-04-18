import prompts from 'prompts';
import { TRepoSyncStackFrame } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
import { PreconditionsFailedError } from '../../lib/errors';
import { currentBranchPrecondition } from '../../lib/preconditions';
import { syncPRInfoForBranches } from '../../lib/sync/pr_info';
import {
  checkoutBranch,
  getTrunk,
  logInfo,
  logNewline,
  logTip,
  trackedUncommittedChanges,
} from '../../lib/utils';
import { Branch } from '../../wrapper-classes/branch';
import { deleteMergedBranches } from '../clean_branches';
import { fixDanglingBranches } from '../fix_dangling_branches';
import { submitAction } from '../submit';
import { pull } from './pull';

export async function syncAction(
  opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    resubmit: boolean;
    fixDanglingBranches: boolean;
  },
  context: TContext
): Promise<void> {
  if (trackedUncommittedChanges()) {
    throw new PreconditionsFailedError('Cannot sync with uncommitted changes');
  }
  const oldBranchName = currentBranchPrecondition(context).name;
  checkoutBranch(getTrunk(context).name);

  if (opts.pull) {
    pull(context, oldBranchName);
  }

  await syncPRInfoForBranches(Branch.allBranches(context), context);

  // This needs to happen before we delete/resubmit so that we can potentially
  // delete or resubmit on the dangling branches.
  if (opts.fixDanglingBranches) {
    await fixDanglingBranches(context, {
      force: opts.force,
      showSyncHint: true,
    });
  }

  const deleteMergedBranchesContinuation = {
    op: 'REPO_SYNC_CONTINUATION' as const,
    force: opts.force,
    resubmit: opts.resubmit,
    oldBranchName: oldBranchName,
  };

  if (opts.delete) {
    logInfo(`Checking if any branches have been merged and can be deleted...`);
    logTip(
      `Disable this behavior at any point in the future with --no-delete`,
      context
    );
    await deleteMergedBranches(
      {
        frame: {
          op: 'DELETE_BRANCHES_CONTINUATION',
          force: opts.force,
          showDeleteProgress: opts.showDeleteProgress,
        },
        parent: [deleteMergedBranchesContinuation],
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

  const trunk = getTrunk(context).name;
  checkoutBranch(
    Branch.exists(frame.oldBranchName) ? frame.oldBranchName : trunk
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
}*/

async function resubmitBranchesWithNewBases(
  force: boolean,
  context: TContext
): Promise<void> {
  const needsResubmission: Branch[] = [];
  Branch.allBranchesWithFilter(
    {
      filter: (b) => {
        const prState = b.getPRInfo()?.state;
        return (
          !b.isTrunk(context) &&
          b.getParentFromMeta(context) !== undefined &&
          prState !== 'MERGED' &&
          prState !== 'CLOSED'
        );
      },
    },
    context
  ).forEach((b) => {
    const currentBase = b.getParentFromMeta(context)?.name;
    const githubBase = b.getPRInfo()?.base;

    if (githubBase && githubBase !== currentBase) {
      needsResubmission.push(b);
    }
  });

  if (needsResubmission.length === 0) {
    return;
  }

  logNewline();
  logInfo(
    [
      `The following branches appear to have been rebased (or cherry-picked) in your local repo but changes have not yet propagated to PR (remote):`,
      ...needsResubmission.map((b) => `- ${b.name}`),
    ].join('\n')
  );

  logTip(
    `Disable this check at any point in the future with --no-resubmit`,
    context
  );

  // Prompt for resubmission.
  let resubmit: boolean = force;
  if (!force) {
    const response = await prompts({
      type: 'confirm',
      name: 'value',
      message: `Update PR to propagate local rebase changes? (PR will be re-submitted)`,
      initial: true,
    });
    resubmit = response.value;
  }
  if (resubmit) {
    logInfo(`Updating PR to propagate local rebase changes...`);
    await submitAction(
      {
        scope: 'FULLSTACK',
        editPRFieldsInline: false,
        draftToggle: false,
        dryRun: false,
        updateOnly: false,
        branchesToSubmit: needsResubmission,
        reviewers: false,
      },
      context
    );
  }
}
