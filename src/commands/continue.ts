import { execSync } from 'child_process';
import yargs from 'yargs';
import { deleteMergedBranches } from '../actions/clean_branches';
import { applyStackEdits } from '../actions/edit/edit_downstack';
import { restackBranch, stackFixActionContinuation } from '../actions/fix';
import {
  stackOntoBaseRebaseContinuation,
  stackOntoFixContinuation,
} from '../actions/onto/stack_onto';
import { repoSyncDeleteMergedBranchesContinuation } from '../actions/sync';
import {
  clearPersistedMergeConflictCallstack,
  getPersistedMergeConflictCallstack,
  MergeConflictCallstackT,
} from '../lib/config/merge_conflict_callstack_config';
import { getPendingStackEdits } from '../lib/config/pending_stack_edits_config';
import { PreconditionsFailedError } from '../lib/errors';
import { profile } from '../lib/telemetry';
import { rebaseInProgress } from '../lib/utils/rebase_in_progress';
import Branch from '../wrapper-classes/branch';
import { branchCountSanityCheckContinuation } from './repo-commands/fix';

const args = {
  edit: {
    describe: `Edit the commit message for an amended, resolved merge conflict. By default true; use --no-edit to set this to false.`,
    demandOption: false,
    default: true,
    type: 'boolean',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'continue';
export const canonical = 'continue';
export const aliases = [];
export const description =
  'Continues the most-recent Graphite command halted by a merge conflict.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    const pendingRebase = rebaseInProgress();
    const mostRecentCheckpoint = getPersistedMergeConflictCallstack();
    const pendingEdits = getPendingStackEdits();

    if (!pendingEdits && !mostRecentCheckpoint && !pendingRebase) {
      throw new PreconditionsFailedError(`No Graphite command to continue.`);
    }

    if (pendingRebase) {
      execSync(`${argv.edit ? '' : 'GIT_EDITOR=true'} git rebase --continue`, {
        stdio: 'inherit',
      });
    }

    if (mostRecentCheckpoint) {
      await resolveCallstack(mostRecentCheckpoint);
      clearPersistedMergeConflictCallstack();
    }

    if (pendingEdits) {
      await applyStackEdits(pendingEdits);
    }
  });
};

async function resolveCallstack(
  callstack: MergeConflictCallstackT
): Promise<void> {
  if (callstack === 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER') {
    return;
  }

  switch (callstack.frame.op) {
    case 'STACK_ONTO_BASE_REBASE_CONTINUATION':
      await stackOntoBaseRebaseContinuation(callstack.frame, callstack.parent);
      break;
    case 'STACK_ONTO_FIX_CONTINUATION':
      await stackOntoFixContinuation(callstack.frame);
      break;
    case 'STACK_FIX': {
      const branch = await Branch.branchWithName(
        callstack.frame.sourceBranchName
      );
      await restackBranch({
        branch: branch,
        mergeConflictCallstack: callstack.parent,
      });
      break;
    }
    case 'STACK_FIX_ACTION_CONTINUATION':
      await stackFixActionContinuation(callstack.frame);
      break;
    case 'DELETE_BRANCHES_CONTINUATION':
      await deleteMergedBranches({
        frame: callstack.frame,
        parent: callstack.parent,
      });
      break;
    case 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION':
      await branchCountSanityCheckContinuation(callstack.frame);
      break;
    case 'REPO_SYNC_CONTINUATION':
      await repoSyncDeleteMergedBranchesContinuation(callstack.frame);
      break;
    default:
      assertUnreachable(callstack.frame);
  }

  await resolveCallstack(callstack.parent);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}
