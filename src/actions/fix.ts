import chalk from 'chalk';
import {
  TMergeConflictCallstack,
  TStackFixActionStackFrame,
} from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import {
  ExitFailedError,
  RebaseConflictError,
  ValidationFailedError,
} from '../lib/errors';
import { checkoutBranch } from '../lib/git/checkout_branch';
import { getBranchRevision } from '../lib/git/get_branch_revision';
import { rebaseOnto } from '../lib/git/rebase';
import { rebaseInProgress } from '../lib/git/rebase_in_progress';
import { uncommittedTrackedChangesPrecondition } from '../lib/preconditions';
import { Branch } from '../wrapper-classes/branch';
import { TScope } from './scope';
import { validate } from './validate';

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
  uncommittedTrackedChangesPrecondition();

  try {
    validate(scope, context);
    context.splog.logInfo('No fix needed');
    return;
  } catch (err) {
    if (!(err instanceof ValidationFailedError)) {
      throw err;
    }

    // If we get interrupted and need to continue, first we'll do a stack fix
    // and then we'll continue the stack fix action.
    const stackFixFrame = {
      op: 'STACK_FIX' as const,
      sourceBranchName: err.currentBranch.name,
    };
    const stackFixActionContinuationFrame = {
      op: 'STACK_FIX_ACTION_CONTINUATION' as const,
      checkoutBranchName: err.currentBranch.name,
    };

    err.branchesToFix.forEach((branch) =>
      restackUpstack(
        {
          branch,
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
}

// If we get interrupted and need to continue, first we'll do a stack fix
// and then we'll continue the stack fix action.

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
      'Cannot fix upstack yet; some uncommitted changes remain. Please commit or stash, and then run `gt continue`',
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
      ontoBranchName: parentBranch.name,
      mergeBase,
      branch,
      mergeConflictCallstack: args.mergeConflictCallstack,
    },
    context
  );

  if (rebased) {
    context.splog.logInfo(
      `Fixed (${chalk.green(branch.name)}) on (${parentBranch.name})`
    );
  }

  // Stacks are now valid, we can update parentRevision
  // TODO: Remove after migrating validation to parentRevision
  if (branch.getParentBranchSha() !== getBranchRevision(parentBranch.name)) {
    context.splog.logDebug(`Updating parent revision`);
    branch.setParentBranch(parentBranch.name);
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
