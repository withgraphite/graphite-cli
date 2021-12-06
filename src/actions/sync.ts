import prompts from 'prompts';
import { repoConfig } from '../lib/config';
import { RepoSyncStackFrameT } from '../lib/config/merge_conflict_callstack_config';
import { ExitFailedError, PreconditionsFailedError } from '../lib/errors';
import {
  cliAuthPrecondition,
  currentBranchPrecondition,
} from '../lib/preconditions';
import { syncPRInfoForBranches } from '../lib/sync/pr_info';
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logInfo,
  uncommittedChanges,
} from '../lib/utils';
import { logNewline, logTip } from '../lib/utils/splog';
import Branch from '../wrapper-classes/branch';
import { deleteMergedBranches } from './clean_branches';
import { fixDanglingBranches } from './fix_dangling_branches';
import { submitBranches } from './submit';

export async function syncAction(opts: {
  pull: boolean;
  force: boolean;
  delete: boolean;
  showDeleteProgress: boolean;
  resubmit: boolean;
  fixDanglingBranches: boolean;
}): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError('Cannot sync with uncommitted changes');
  }
  const oldBranch = currentBranchPrecondition();
  const trunk = getTrunk().name;
  checkoutBranch(trunk);

  if (opts.pull) {
    logNewline();
    logInfo(`Pulling in new changes...`);
    logTip(`Disable this behavior at any point in the future with --no-pull`);
    gpExecSync({ command: `git pull --prune` }, (err) => {
      checkoutBranch(oldBranch.name);
      throw new ExitFailedError(`Failed to pull trunk ${trunk}`, err);
    });
  }

  await syncPRInfoForBranches(Branch.allBranches());

  // This needs to happen before we delete/resubmit so that we can potentially
  // delete or resubmit on the dangling branches.
  if (opts.fixDanglingBranches) {
    logNewline();
    logInfo(`Ensuring tracked branches in Graphite are all well-formed...`);
    logTip(
      `Disable this behavior at any point in the future with --no-show-dangling`
    );
    await fixDanglingBranches(opts.force);
  }

  const deleteMergedBranchesContinuation = {
    op: 'REPO_SYNC_CONTINUATION' as const,
    force: opts.force,
    resubmit: opts.resubmit,
    oldBranchName: oldBranch.name,
  };

  if (opts.delete) {
    logNewline();
    logInfo(`Checking if any branches have been merged and can be deleted...`);
    logTip(`Disable this behavior at any point in the future with --no-delete`);
    await deleteMergedBranches({
      frame: {
        op: 'DELETE_BRANCHES_CONTINUATION',
        force: opts.force,
        showDeleteProgress: opts.showDeleteProgress,
      },
      parent: {
        frame: deleteMergedBranchesContinuation,
        parent: 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER',
      },
    });
  }

  await repoSyncDeleteMergedBranchesContinuation(
    deleteMergedBranchesContinuation
  );
}

export async function repoSyncDeleteMergedBranchesContinuation(
  frame: RepoSyncStackFrameT
): Promise<void> {
  if (frame.resubmit) {
    await resubmitBranchesWithNewBases(frame.force);
  }

  const trunk = getTrunk().name;
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

async function resubmitBranchesWithNewBases(force: boolean): Promise<void> {
  const needsResubmission: Branch[] = [];
  Branch.allBranchesWithFilter({
    filter: (b) => {
      const prState = b.getPRInfo()?.state;
      return (
        !b.isTrunk() &&
        b.getParentFromMeta() !== undefined &&
        prState !== 'MERGED' &&
        prState !== 'CLOSED'
      );
    },
  }).forEach((b) => {
    const currentBase = b.getParentFromMeta()?.name;
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
      `Detected merge bases changes for:`,
      ...needsResubmission.map((b) => `- ${b.name}`),
    ].join('\n')
  );
  logTip(`Disable this behavior at any point in the future with --no-resubmit`);

  // Prompt for resubmission.
  let resubmit: boolean = force;
  if (!force) {
    const response = await prompts({
      type: 'confirm',
      name: 'value',
      message: `Update remote PR mergebases to match local?`,
      initial: true,
    });
    resubmit = response.value;
  }
  if (resubmit) {
    logInfo(`Updating outstanding PR mergebases...`);
    const cliAuthToken = cliAuthPrecondition();
    const repoName = repoConfig.getRepoName();
    const repoOwner = repoConfig.getRepoOwner();
    await submitBranches({
      branchesToSubmit: needsResubmission,
      cliAuthToken: cliAuthToken,
      repoOwner: repoOwner,
      repoName: repoName,
      editPRFieldsInline: false,
      createNewPRsAsDraft: false,
    });
  }
}
