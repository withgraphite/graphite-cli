import yargs from 'yargs';
import { cleanBranches } from '../actions/clean_branches';
import { applyStackEdits } from '../actions/edit/edit_downstack';
import { fixAction, stackFixActionContinuation } from '../actions/fix';
import {
  stackOntoBaseRebaseContinuation,
  stackOntoFixContinuation,
} from '../actions/onto/stack_onto';
import { finishRestack } from '../actions/restack';
import { cleanBranchesContinuation } from '../actions/sync/sync';
import { TMergeConflictCallstack } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import { PreconditionsFailedError, RebaseConflictError } from '../lib/errors';
import { addAll } from '../lib/git/add_all';
import { rebaseInProgress } from '../lib/git/rebase_in_progress';
import { profile } from '../lib/telemetry/profile';
import { assertUnreachable } from '../lib/utils/assert_unreachable';
import { deleteMergedBranchesContinuation } from './repo-commands/fix';

const args = {
  all: {
    describe: `Stage all changes before continuing.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'a',
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

    // TODO  would we ever have this without a pending rebase?
    if (!mostRecentCheckpoint && !pendingRebase) {
      throw new PreconditionsFailedError(`No Graphite command to continue.`);
    }

    if (argv.all) {
      addAll();
    }

    // TODO change this to early exit if we don't have a rebase in progress
    if (pendingRebase) {
      if (context.metaCache.continueRebase() === 'REBASE_CONFLICT') {
        throw new RebaseConflictError(`Rebase conflict is not yet resolved.`);
      }
      finishRestack(context);
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

  context.splog.logDebug(`Resolving frame: ${frame.op}`);

  switch (frame.op) {
    case 'STACK_ONTO_BASE_REBASE_CONTINUATION':
      stackOntoBaseRebaseContinuation(frame, remaining, context);
      break;
    case 'STACK_ONTO_FIX_CONTINUATION':
      stackOntoFixContinuation(frame, context);
      break;
    case 'STACK_FIX': {
      fixAction(
        { scope: 'UPSTACK', mergeConflictCallstack: remaining },
        context
      );
      break;
    }
    case 'STACK_FIX_ACTION_CONTINUATION':
      stackFixActionContinuation(frame);
      break;
    case 'DELETE_BRANCHES_CONTINUATION':
      await cleanBranches(
        {
          frame: frame,
          parent: remaining,
        },
        context
      );
      break;
    case 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION':
      deleteMergedBranchesContinuation(context);
      break;
    case 'REPO_SYNC_CONTINUATION':
      await cleanBranchesContinuation(frame, context);
      break;
    case 'STACK_EDIT_CONTINUATION':
      applyStackEdits(frame.currentBranchName, frame.remainingEdits, context);
      break;
    default:
      assertUnreachable(frame);
  }

  await resolveCallstack(remaining, context);
}
