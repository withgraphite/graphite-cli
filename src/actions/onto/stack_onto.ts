import { cache } from '../../lib/config/cache';
import {
  TMergeConflictCallstack,
  TStackOntoBaseRebaseStackFrame,
  TStackOntoFixStackFrame,
} from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context';
import { PreconditionsFailedError } from '../../lib/errors';
import { getMergeBase } from '../../lib/git/merge_base';
import { rebaseOnto } from '../../lib/git/rebase';
import { branchExistsPrecondition } from '../../lib/preconditions';
import { logInfo } from '../../lib/utils/splog';
import { getTrunk } from '../../lib/utils/trunk';
import { Branch } from '../../wrapper-classes/branch';
import { fixAction } from '../fix';
import { validate } from '../validate';

export function stackOnto(
  opts: {
    currentBranch: Branch;
    onto: string;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): void {
  branchExistsPrecondition(opts.onto);
  checkBranchCanBeMoved(opts.currentBranch, context);
  validate('UPSTACK', context);

  const stackOntoContinuationFrame = {
    op: 'STACK_ONTO_BASE_REBASE_CONTINUATION' as const,
    currentBranchName: opts.currentBranch.name,
    onto: opts.onto,
  };

  const parent = opts.currentBranch.getParentFromMeta(context);

  const mergeBase = getMergeBase(
    opts.currentBranch.name,
    parent?.name ?? opts.onto
  );

  const rebased = rebaseOnto(
    {
      ontoBranchName: opts.onto,
      mergeBase,
      branch: opts.currentBranch,
      mergeConflictCallstack: [
        stackOntoContinuationFrame,
        ...opts.mergeConflictCallstack,
      ],
    },
    context
  );

  if (!rebased) {
    if (!parent) {
      opts.currentBranch.setParentBranch(opts.onto);
    }
    return;
  }

  stackOntoBaseRebaseContinuation(
    stackOntoContinuationFrame,
    opts.mergeConflictCallstack,
    context
  );
}

export function stackOntoBaseRebaseContinuation(
  frame: TStackOntoBaseRebaseStackFrame,
  mergeConflictCallstack: TMergeConflictCallstack,
  context: TContext
): void {
  const currentBranch = Branch.branchWithName(frame.currentBranchName);
  const onto = frame.onto;

  cache.clearAll();
  // set current branch's parent only if the rebase succeeds.
  logInfo(`Setting parent of ${currentBranch.name} to ${onto}.`);
  currentBranch.setParentBranch(onto);

  // Now perform a fix starting from the onto branch:
  const stackOntoContinuationFrame = {
    op: 'STACK_ONTO_FIX_CONTINUATION' as const,
    currentBranchName: frame.currentBranchName,
    onto: frame.onto,
  };

  fixAction(
    {
      scope: 'UPSTACK',
      mergeConflictCallstack: [
        stackOntoContinuationFrame,
        ...mergeConflictCallstack,
      ],
    },
    context
  );

  stackOntoFixContinuation(stackOntoContinuationFrame);
}

export function stackOntoFixContinuation(frame: TStackOntoFixStackFrame): void {
  logInfo(
    `Successfully moved (${frame.currentBranchName}) onto (${frame.onto})`
  );
}

function checkBranchCanBeMoved(branch: Branch, context: TContext) {
  if (branch.name === getTrunk(context).name) {
    throw new PreconditionsFailedError(
      `Cannot move (${branch.name}) as it is currently set as trunk.`
    );
  }
}
