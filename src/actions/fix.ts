import chalk from 'chalk';
import prompts from 'prompts';
import { cache } from '../lib/config/cache';
import {
  TMergeConflictCallstack,
  TStackFixActionStackFrame,
} from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context/context';
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
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logDebug,
  logInfo,
  logWarn,
  rebaseInProgress,
} from '../lib/utils';
import { indentMultilineString } from '../lib/utils/indent_multiline_string';
import {
  GitStackBuilder,
  MetaStackBuilder,
  Stack,
  StackNode,
} from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';

// Should be called whenever we change the tip of a branch
export async function rebaseUpstack(context: TContext): Promise<void> {
  try {
    await fixAction(
      {
        action: 'rebase',
        mergeConflictCallstack: [],
        scope: 'upstack',
      },
      context
    );
  } catch {
    logWarn(
      'Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix --rebase`'
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

type TFixScope = 'stack' | 'upstack';

export async function fixAction(
  opts: {
    action: 'regen' | 'rebase' | undefined;
    mergeConflictCallstack: TMergeConflictCallstack;
    scope: TFixScope;
  },
  context: TContext
): Promise<void> {
  const currentBranch = currentBranchPrecondition(context);
  uncommittedTrackedChangesPrecondition();

  logDebug(`Determining meta ${opts.scope} from ${currentBranch.name}`);
  const metaStack =
    opts.scope === 'stack'
      ? new MetaStackBuilder({
          useMemoizedResults: true,
        }).fullStackFromBranch(currentBranch, context)
      : new MetaStackBuilder({
          useMemoizedResults: true,
        }).upstackInclusiveFromBranchWithParents(currentBranch, context);
  logDebug(`Found meta ${opts.scope}.`);
  logDebug(metaStack.toString());

  logDebug(`Determining full git ${opts.scope} from ${currentBranch.name}`);
  const gitStack =
    opts.scope === 'stack'
      ? new GitStackBuilder({
          useMemoizedResults: true,
        }).fullStackFromBranch(currentBranch, context)
      : new GitStackBuilder({
          useMemoizedResults: true,
        }).upstackInclusiveFromBranchWithParents(currentBranch, context);
  logDebug(`Found full git ${opts.scope}`);
  logDebug(gitStack.toString());

  // Consider noop
  if (metaStack.equals(gitStack)) {
    logInfo(`No fix needed`);
    return;
  }

  const action = opts.action || (await promptStacks({ gitStack, metaStack }));

  const stackFixActionContinuationFrame = {
    op: 'STACK_FIX_ACTION_CONTINUATION' as const,
    checkoutBranchName: currentBranch.name,
  };

  if (action === 'regen') {
    regen(currentBranch, context, opts.scope);
  } else {
    // If we get interrupted and need to continue, first we'll do a stack fix
    // and then we'll continue the stack fix action.
    const mergeConflictCallstack = [
      {
        op: 'STACK_FIX' as const,
        sourceBranchName: currentBranch.name,
      },
      stackFixActionContinuationFrame,
      ...opts.mergeConflictCallstack,
    ];
    for (const child of metaStack.source.children) {
      restackNode(
        {
          node: child,
          mergeConflictCallstack: mergeConflictCallstack,
        },
        context
      );
    }
  }

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
  const metaStack =
    new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
      args.branch,
      context
    );

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

  restackNode(
    {
      node: metaStack.source,
      mergeConflictCallstack: mergeConflictCallstack,
    },
    context
  );

  stackFixActionContinuation(stackFixActionContinuationFrame);
}

function restackNode(
  args: {
    node: StackNode;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): void {
  const node = args.node;

  if (rebaseInProgress()) {
    throw new RebaseConflictError(
      `Interactive rebase still in progress, cannot fix (${node.branch.name}).`,
      args.mergeConflictCallstack,
      context
    );
  }
  const parentBranch = node.parent?.branch;
  if (!parentBranch) {
    throw new ExitFailedError(
      `Cannot find parent in stack for (${node.branch.name}), stopping fix`
    );
  }
  const mergeBase = node.branch.getMetaMergeBase(context);
  if (!mergeBase) {
    throw new ExitFailedError(
      `Cannot find a merge base in the stack for (${node.branch.name}), stopping fix`
    );
  }

  if (parentBranch.ref(context) === mergeBase) {
    logInfo(
      `No fix needed for (${node.branch.name}) on (${parentBranch.name})`
    );
  } else {
    logInfo(
      `Fixing (${chalk.green(node.branch.name)}) on (${parentBranch.name})`
    );
    checkoutBranch(node.branch.name, { quiet: true });
    node.branch.savePrevRef();
    gpExecSync(
      {
        command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${node.branch.name}`,
        options: { stdio: 'ignore' },
      },
      () => {
        if (rebaseInProgress()) {
          throw new RebaseConflictError(
            `Interactive rebase in progress, cannot fix (${node.branch.name}) onto (${parentBranch.name}).`,
            args.mergeConflictCallstack,
            context
          );
        }
      }
    );
    cache.clearAll();
  }

  for (const child of node.children) {
    restackNode(
      {
        node: child,
        mergeConflictCallstack: args.mergeConflictCallstack,
      },
      context
    );
  }
}

function regen(branch: Branch, context: TContext, scope: TFixScope): void {
  const trunk = getTrunk(context);
  if (trunk.name == branch.name) {
    regenAllStacks(context);
    return;
  }

  const gitStack =
    scope === 'stack'
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
    } else {
      logInfo(
        `-> Updating (${branch.name}) branch parent from (${
          oldParent?.name
        }) to (${chalk.green(newParent.name)})`
      );
      branch.setParentBranch(newParent.name, newParent.getCurrentRef());
    }
  }

  node.children.forEach((c) => recursiveRegen(c, context));
}
