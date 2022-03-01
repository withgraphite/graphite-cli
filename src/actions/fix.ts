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
  rebaseInProgress,
} from '../lib/utils';
import {
  GitStackBuilder,
  MetaStackBuilder,
  Stack,
  StackNode,
} from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';

async function promptStacks(opts: {
  gitStack: Stack;
  metaStack: Stack;
}): Promise<'regen' | 'rebase'> {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: `Rebase branches or regenerate stacks metadata?`,
    choices: ['rebase', 'regen'].map(
      (r) => {
        return {
          title:
            r === 'rebase'
              ? `rebase branches, using Graphite stacks as truth (${chalk.green(
                  'common choice'
                )})\n` +
                opts.metaStack
                  .toString()
                  .split('\n')
                  .map((l) => '    ' + l)
                  .join('\n') +
                '\n'
              : `regen stack metadata, using Git commit tree as truth\n` +
                opts.gitStack
                  .toString()
                  .split('\n')
                  .map((l) => '    ' + l)
                  .join('\n') +
                '\n',
          value: r,
        };
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    ),
  });

  if (!response.value) {
    throw new ExitCancelledError('No changes made');
  }

  return response.value;
}

export async function fixAction(
  opts: {
    action: 'regen' | 'rebase' | undefined;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): Promise<void> {
  const currentBranch = currentBranchPrecondition(context);
  uncommittedTrackedChangesPrecondition();

  logDebug(`Determining full meta stack from ${currentBranch.name}`);
  const metaStack = new MetaStackBuilder({
    useMemoizedResults: true,
  }).fullStackFromBranch(currentBranch, context);
  logDebug(`Found full meta stack.`);
  logDebug(metaStack.toString());

  logDebug(`Determining full git stack from ${currentBranch.name}`);
  const gitStack = new GitStackBuilder({
    useMemoizedResults: true,
  }).fullStackFromBranch(currentBranch, context);
  logDebug(`Found full git stack`);
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
    await regen(currentBranch, context);
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
      await restackNode(
        {
          node: child,
          mergeConflictCallstack: mergeConflictCallstack,
        },
        context
      );
    }
  }

  await stackFixActionContinuation(stackFixActionContinuationFrame);
}

export async function stackFixActionContinuation(
  frame: TStackFixActionStackFrame
): Promise<void> {
  checkoutBranch(frame.checkoutBranchName);
}

export async function restackBranch(
  args: {
    branch: Branch;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): Promise<void> {
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

  await restackNode(
    {
      node: metaStack.source,
      mergeConflictCallstack: mergeConflictCallstack,
    },
    context
  );

  await stackFixActionContinuation(stackFixActionContinuationFrame);
}

async function restackNode(
  args: {
    node: StackNode;
    mergeConflictCallstack: TMergeConflictCallstack;
  },
  context: TContext
): Promise<void> {
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
    checkoutBranch(node.branch.name);
    node.branch.setMetaPrevRef(node.branch.getCurrentRef());
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
    await restackNode(
      {
        node: child,
        mergeConflictCallstack: args.mergeConflictCallstack,
      },
      context
    );
  }
}

async function regen(branch: Branch, context: TContext): Promise<void> {
  const trunk = getTrunk(context);
  if (trunk.name == branch.name) {
    regenAllStacks(context);
    return;
  }

  const gitStack = new GitStackBuilder().fullStackFromBranch(branch, context);
  await recursiveRegen(gitStack.source, context);
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
      branch.setParentBranchName(newParent.name);
    }
  }

  node.children.forEach((c) => recursiveRegen(c, context));
}
