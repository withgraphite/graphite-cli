import { execSync } from 'child_process';
import yargs from 'yargs';
import { deleteMergedBranches } from '../actions/clean_branches';
import { applyStackEdits } from '../actions/edit/edit_downstack';
import { restackBranch, stackFixActionContinuation } from '../actions/fix';
import {
  stackOntoBaseRebaseContinuation,
  stackOntoFixContinuation,
} from '../actions/onto/stack_onto';
import { repoSyncDeleteMergedBranchesContinuation } from '../actions/sync/sync';
import { TMergeConflictCallstack } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context/context';
import { PreconditionsFailedError } from '../lib/errors';
import { profile } from '../lib/telemetry';
import { rebaseInProgress } from '../lib/utils/rebase_in_progress';
import { Branch } from '../wrapper-classes/branch';
import { deleteMergedBranchesContinuation } from './repo-commands/fix';

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
  return profile(argv, canonical, async (context) => {
    const pendingRebase = rebaseInProgress();
    const mostRecentCheckpoint =
      context.mergeConflictCallstackConfig?.data.callstack;

    if (!mostRecentCheckpoint && !pendingRebase) {
      throw new PreconditionsFailedError(`No Graphite command to continue.`);
    }

    if (pendingRebase) {
      execSync(`${argv.edit ? '' : 'GIT_EDITOR=true'} git rebase --continue`, {
        stdio: 'inherit',
      });
    }

    if (mostRecentCheckpoint) {
      await resolveCallstack(mostRecentCheckpoint, context);
      context.mergeConflictCallstackConfig?.delete();
    }
  });
};

async function resolveCallstack(
  callstack: TMergeConflictCallstack,
  context: TContext
): Promise<void> {
  if (callstack.length === 0) {
    return;
  }

  const frame = callstack[0];
  const remaining = callstack.slice(1);

  switch (frame.op) {
    case 'STACK_ONTO_BASE_REBASE_CONTINUATION':
      await stackOntoBaseRebaseContinuation(frame, remaining, context);
      break;
    case 'STACK_ONTO_FIX_CONTINUATION':
      await stackOntoFixContinuation(frame);
      break;
    case 'STACK_FIX': {
      const branch = await Branch.branchWithName(
        frame.sourceBranchName,
        context
      );
      await restackBranch(
        {
          branch: branch,
          mergeConflictCallstack: remaining,
        },
        context
      );
      break;
    }
    case 'STACK_FIX_ACTION_CONTINUATION':
      await stackFixActionContinuation(frame);
      break;
    case 'DELETE_BRANCHES_CONTINUATION':
      await deleteMergedBranches(
        {
          frame: frame,
          parent: remaining,
        },
        context
      );
      break;
    case 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION':
      deleteMergedBranchesContinuation();
      break;
    case 'REPO_SYNC_CONTINUATION':
      await repoSyncDeleteMergedBranchesContinuation(frame, context);
      break;
    case 'STACK_EDIT_CONTINUATION':
      await applyStackEdits(frame.remainingEdits, context);
      break;
    default:
      assertUnreachable(frame);
  }

  await resolveCallstack(remaining, context);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
function assertUnreachable(_arg: never): void {}
