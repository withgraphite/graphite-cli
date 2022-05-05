import chalk from 'chalk';
import { TContext } from '../lib/context';
import { ExitFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { logDebug, logTip } from '../lib/utils/splog';
import { getTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';
import { GitStackBuilder } from '../wrapper-classes/git_stack_builder';
import { Stack } from '../wrapper-classes/stack';
import { StackNode } from '../wrapper-classes/stack_node';

function getStacks(context: TContext): {
  fallenStacks: Stack[];
  untrackedStacks: Stack[];
  trunkStack: Stack;
} {
  const stacks = new GitStackBuilder({
    useMemoizedResults: true,
  }).allStacks(context);

  const trunkStack = stacks.find((s) => s.source.branch.isTrunk(context));
  if (!trunkStack) {
    throw new ExitFailedError(`Unable to find trunk stack`);
  }
  const fallenStacks: Stack[] = [];
  const untrackedStacks: Stack[] = [];

  stacks
    .filter((s) => !s.source.branch.isTrunk(context))
    .forEach((s) => {
      if (s.source.branch.getParentFromMeta(context)) {
        fallenStacks.push(s);
      } else {
        untrackedStacks.push(s);
      }
    });
  return { trunkStack, fallenStacks, untrackedStacks };
}

export async function logShortAction(context: TContext): Promise<void> {
  const currentBranch = currentBranchPrecondition();
  logDebug(`Getting stacks...`);
  const stacks = getStacks(context);
  logDebug(
    `Got stacks (${stacks.fallenStacks.length} fallen; ${stacks.untrackedStacks.length} untracked)...`
  );

  const tips = printStackNode(
    stacks.trunkStack.source,
    {
      indent: 0,
      currentBranch: currentBranch,
    },
    context
  );

  stacks.fallenStacks.sort(sortStacksByAge).forEach((s) => {
    printStackNode(
      s.source,
      {
        indent: 0,
        currentBranch,
      },
      context
    );
  });

  if (tips.needsFix || stacks.fallenStacks.length > 0) {
    logRebaseTip(context);
  }

  if (stacks.untrackedStacks.length > 0) {
    console.log('\nuntracked (created without Graphite)');
    stacks.untrackedStacks.sort(sortStacksByAge).forEach((s) =>
      printStackNode(
        s.source,
        {
          indent: 0,
          currentBranch,
        },
        context
      )
    );
  }

  if (stacks.untrackedStacks.length > 0 || tips.untracked) {
    logRegenTip(context);
  }
}

function sortStacksByAge(a: Stack, b: Stack): number {
  return a.source.branch.lastCommitTime() > b.source.branch.lastCommitTime()
    ? -1
    : 1;
}

function printStackNode(
  node: StackNode,
  opts: { indent: number; currentBranch: Branch },
  context: TContext
): { needsFix: boolean; untracked: boolean } {
  const metaParent = node.branch.getParentFromMeta(context);
  const untracked = !metaParent && !node.branch.isTrunk(context);
  const needsFix: boolean =
    !!metaParent &&
    (!node.parent || metaParent.name !== node.parent.branch.name);
  const tips = { untracked, needsFix };
  node.children.forEach((c) => {
    if (!c.branch.isTrunk(context)) {
      const childTips = printStackNode(
        c,
        {
          indent: opts.indent + 1,
          currentBranch: opts.currentBranch,
        },
        context
      );

      tips.untracked = tips.untracked || childTips.untracked;
      tips.needsFix = tips.needsFix || childTips.needsFix;
    }
  });
  console.log(
    [
      // indent
      `${'  '.repeat(opts.indent)}`,
      // branch name, potentially highlighted
      node.branch.name === opts.currentBranch.name
        ? chalk.cyan(`↱ ${node.branch.name}`)
        : `↱ ${node.branch.name}`,
      // whether it needs a rebase or not
      ...(needsFix ? [chalk.yellow(`(off ${metaParent?.name})`)] : []),
      ...(untracked ? [chalk.yellow(`(untracked)`)] : []),
    ].join(' ')
  );
  return tips;
}

function logRebaseTip(context: TContext): void {
  logTip(
    [
      `Some branch merge-bases have fallen behind their parent branch's latest commit. Consider:`,
      `> gt branch checkout ${getTrunk(
        context
      )} && gt stack fix # fix all stacks`,
      `> gt branch checkout <branch> && gt stack fix # fix a specific stack`,
      `> gt branch checkout <branch> && gt upstack onto <parent> # fix a stack and update the parent`,
    ].join('\n'),
    context
  );
}

function logRegenTip(context: TContext): void {
  logTip(
    [
      'Graphite does not know the parent of untracked branches. Consider:',
      `> gt branch checkout <branch> && gt upstack onto <parent> # fix a stack and update the parent`,
      `> gt branch delete -f <branch> # delete branch from git`,
    ].join('\n'),
    context
  );
}
