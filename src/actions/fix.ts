import chalk from 'chalk';
import {
  TMergeConflictCallstack,
  TStackFixActionStackFrame,
} from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import { ExitFailedError, RebaseConflictError } from '../lib/errors';
import { checkoutBranch } from '../lib/git/checkout_branch';
import { rebaseOnto } from '../lib/git/rebase';
import { rebaseInProgress } from '../lib/git/rebase_in_progress';
import {
  currentBranchPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../lib/preconditions';
import { logDebug, logInfo, logWarn } from '../lib/utils/splog';
import { Branch } from '../wrapper-classes/branch';
import { TScope } from './scope';
import {
  backfillParentShasOnValidatedStack,
  getStacksForValidation,
} from './validate';

// Should be called whenever we change the tip of a branch
export function rebaseUpstack(
  context: TContext,
  mergeConflictCallstack: TMergeConflictCallstack = []
): void {
  try {
    fixAction({ scope: 'UPSTACK', mergeConflictCallstack }, context);
  } catch {
    logWarn(
      'Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt upstack fix`'
    );
  }
}

type TFixScope = Exclude<TScope, 'DOWNSTACK'>;

export function fixAction(
  {
    scope,
    mergeConflictCallstack = [],
  }: {
    scope: TFixScope;
    mergeConflictCallstack?: TMergeConflictCallstack;
  },
  context: TContext
): void {
  const currentBranch = currentBranchPrecondition();
  uncommittedTrackedChangesPrecondition();

  const { metaStack, gitStack } = getStacksForValidation(
    currentBranch,
    scope,
    context
  );

  // Consider noop
  if (metaStack.equals(gitStack)) {
    logInfo(`No fix needed`);
    // Stacks are valid, we can update parentRevision
    // TODO: Remove after migrating validation to parentRevision
    backfillParentShasOnValidatedStack(metaStack, context);
    return;
  }

  // If we get interrupted and need to continue, first we'll do a stack fix
  // and then we'll continue the stack fix action.
  const stackFixFrame = {
    op: 'STACK_FIX' as const,
    sourceBranchName: currentBranch.name,
  };

  const stackFixActionContinuationFrame = {
    op: 'STACK_FIX_ACTION_CONTINUATION' as const,
    checkoutBranchName: currentBranch.name,
  };

  metaStack.source.children.forEach((child) =>
    restackUpstack(
      {
        branch: child.branch,
        mergeConflictCallstack: [
          stackFixFrame,
          stackFixActionContinuationFrame,
          ...mergeConflictCallstack,
        ],
      },
      context
    )
  );

  stackFixActionContinuation(stackFixActionContinuationFrame);
}

export function stackFixActionContinuation(
  frame: TStackFixActionStackFrame
): void {
  checkoutBranch(frame.checkoutBranchName, { quiet: true });
}

function restackUpstack(
  args: {
    branch: Branch;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): void {
  const branch = args.branch;
  if (rebaseInProgress()) {
    throw new RebaseConflictError(
      `Interactive rebase still in progress, cannot fix (${branch.name}).`,
      args.mergeConflictCallstack,
      context
    );
  }

  const parentBranch = branch.getParentFromMeta(context);
  if (!parentBranch) {
    throw new ExitFailedError(
      `Cannot find parent in stack for (${branch.name}), stopping fix`
    );
  }

  const mergeBase = branch.getMetaMergeBase(context);
  if (!mergeBase) {
    throw new ExitFailedError(
      `Cannot find a merge base in the stack for (${branch.name}), stopping fix`
    );
  }

  const rebased = rebaseOnto(
    {
      onto: parentBranch,
      mergeBase,
      branch,
      mergeConflictCallstack: args.mergeConflictCallstack,
    },
    context
  );

  if (rebased) {
    logInfo(`Fixed (${chalk.green(branch.name)}) on (${parentBranch.name})`);
  }

  // Stacks are now valid, we can update parentRevision
  // TODO: Remove after migrating validation to parentRevision
  if (branch.getParentBranchSha() !== parentBranch.getCurrentRef()) {
    logDebug(`Updating parent revision`);
    branch.setParentBranch(parentBranch);
  }

  branch.getChildrenFromMeta(context).forEach((child) =>
    restackUpstack(
      {
        branch: child,
        mergeConflictCallstack: args.mergeConflictCallstack,
      },
      context
    )
  );
}
