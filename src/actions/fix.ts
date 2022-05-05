import chalk from 'chalk';
import prompts from 'prompts';
import {
  TMergeConflictCallstack,
  TStackFixActionStackFrame,
} from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import {
  ExitCancelledError,
  ExitFailedError,
  KilledError,
  RebaseConflictError,
} from '../lib/errors';
import {
  currentBranchPrecondition,
  uncommittedTrackedChangesPrecondition,
} from '../lib/preconditions';
import { checkoutBranch } from '../lib/utils/checkout_branch';
import { indentMultilineString } from '../lib/utils/indent_multiline_string';
import { rebaseInProgress } from '../lib/utils/rebase_in_progress';
import { rebaseOnto } from '../lib/utils/rebase_onto';
import { logDebug, logInfo, logWarn } from '../lib/utils/splog';
import { getTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';
import { GitStackBuilder } from '../wrapper-classes/git_stack_builder';
import { Stack } from '../wrapper-classes/stack';
import { StackNode } from '../wrapper-classes/stack_node';
import { TScope } from './scope';
import {
  backfillParentShasOnValidatedStack,
  getStacksForValidation,
} from './validate';

// Should be called whenever we change the tip of a branch
export async function rebaseUpstack(context: TContext): Promise<void> {
  try {
    await fixAction(
      {
        action: 'rebase',
        scope: 'UPSTACK',
      },
      context
    );
  } catch {
    logWarn(
      'Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt upstack fix --rebase`'
    );
  }
}

async function promptStacks(opts: {
  gitStack: Stack;
  metaStack: Stack;
}): Promise<'regen' | 'rebase'> {
  const response = await prompts(
    {
      type: 'select',
      name: 'value',
      message: `Rebase branches or regenerate stacks metadata?`,
      choices: [
        {
          title:
            `rebase branches, using Graphite stacks as truth (${chalk.green(
              'common choice'
            )})\n` +
            indentMultilineString(opts.metaStack.toString(), 4) +
            '\n',
          value: 'rebase',
        },
        {
          title:
            `regen stack metadata, using Git commit tree as truth\n` +
            indentMultilineString(opts.gitStack.toString(), 4) +
            +'\n',
          value: 'regen',
        },
      ],
    },
    {
      onCancel: () => {
        throw new KilledError();
      },
    }
  );

  if (!response.value) {
    throw new ExitCancelledError('No changes made');
  }

  return response.value;
}

type TFixScope = Exclude<TScope, 'DOWNSTACK'>;

export async function fixAction(
  opts: {
    action: 'regen' | 'rebase' | undefined;
    scope: TFixScope;
  },
  context: TContext
): Promise<void> {
  const currentBranch = currentBranchPrecondition(context);
  uncommittedTrackedChangesPrecondition();

  const { metaStack, gitStack } = getStacksForValidation(
    currentBranch,
    opts.scope,
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

  const action = opts.action || (await promptStacks({ gitStack, metaStack }));

  if (action === 'regen') {
    regen(currentBranch, context, opts.scope);
    return;
  }

  const stackFixActionContinuationFrame = {
    op: 'STACK_FIX_ACTION_CONTINUATION' as const,
    checkoutBranchName: currentBranch.name,
  };

  // If we get interrupted and need to continue, first we'll do a stack fix
  // and then we'll continue the stack fix action.
  const mergeConflictCallstack = [
    {
      op: 'STACK_FIX' as const,
      sourceBranchName: currentBranch.name,
    },
    stackFixActionContinuationFrame,
  ];

  metaStack.source.children.forEach((child) =>
    restackUpstack(
      {
        branch: child.branch,
        mergeConflictCallstack: mergeConflictCallstack,
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

export function restackBranch(
  args: {
    branch: Branch;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): void {
  const stackFixActionContinuationFrame = {
    op: 'STACK_FIX_ACTION_CONTINUATION' as const,
    checkoutBranchName: args.branch.name,
  };

  const mergeConflictCallstack = [
    {
      op: 'STACK_FIX' as const,
      sourceBranchName: args.branch.name,
    },
    stackFixActionContinuationFrame,
    ...args.mergeConflictCallstack,
  ];

  restackUpstack(
    {
      branch: args.branch,
      mergeConflictCallstack: mergeConflictCallstack,
    },
    context
  );

  stackFixActionContinuation(stackFixActionContinuationFrame);
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

function regen(branch: Branch, context: TContext, scope: TFixScope): void {
  const trunk = getTrunk(context);
  if (trunk.name == branch.name) {
    regenAllStacks(context);
    return;
  }

  const gitStack =
    scope === 'FULLSTACK'
      ? new GitStackBuilder().fullStackFromBranch(branch, context)
      : new GitStackBuilder().upstackInclusiveFromBranchWithParents(
          branch,
          context
        );
  recursiveRegen(gitStack.source, context);
}

function regenAllStacks(context: TContext): void {
  const allGitStacks = new GitStackBuilder().allStacks(context);
  logInfo(`Computing regenerating ${allGitStacks.length} stacks...`);
  allGitStacks.forEach((stack) => {
    logInfo(`\nRegenerating:\n${stack.toString()}`);
    recursiveRegen(stack.source, context);
  });
}

function recursiveRegen(node: StackNode, context: TContext): void {
  // The only time we expect newParent to be undefined is if we're fixing
  // the base branch which is behind trunk.
  const branch = node.branch;

  // Set parents if not trunk
  if (branch.name !== getTrunk(context).name) {
    const oldParent = branch.getParentFromMeta(context);
    const newParent = node.parent?.branch || getTrunk(context);
    if (oldParent && oldParent.name === newParent.name) {
      logInfo(
        `-> No change for (${branch.name}) with branch parent (${oldParent.name})`
      );
      // Stacks are valid, we can update parentRevision
      // TODO: Remove after migrating validation to parentRevision
      if (branch.getParentBranchSha() !== newParent.getCurrentRef()) {
        logDebug(`Updating parent revision`);
        branch.setParentBranch(newParent);
      }
    } else {
      logInfo(
        `-> Updating (${branch.name}) branch parent from (${
          oldParent?.name
        }) to (${chalk.green(newParent.name)})`
      );
      branch.setParentBranch(newParent);
    }
  }

  node.children.forEach((c) => recursiveRegen(c, context));
}
