import chalk from 'chalk';
import { TContext } from '../lib/context';
import { displayBranchName } from './display_branches';
import { getBranchInfo } from './show_branch';

export function logAction(
  opts: { style: 'SHORT' | 'FULL'; reverse: boolean },
  context: TContext
): void {
  printStack(
    {
      short: opts.style === 'SHORT',
      reverse: opts.reverse,
      branchName: context.metaCache.trunk,
      indentLevel: 0,
    },
    context
  );
}

type TPrintStackArgs = {
  short: boolean;
  reverse: boolean;
  branchName: string;
  indentLevel: number;
};

export function printStack(args: TPrintStackArgs, context: TContext): void {
  // In standard mode, print the children before this branch
  if (!args.reverse) {
    printStacksForChildren(args, context);
  }

  printBranch(args, context);

  // In reverse mode, print the children after this branch
  if (args.reverse) {
    printStacksForChildren(args, context);
  }

  // Only print this tip at the end of the whole stack
  if (args.short && context.metaCache.isTrunk(args.branchName)) {
    context.splog.logTip(
      'Miss the old version of log short? Try the --classic flag!'
    );
  }
}

function printStacksForChildren(args: TPrintStackArgs, context: TContext) {
  const children = context.metaCache.getChildren(args.branchName);
  children.forEach((child, i) =>
    printStack(
      {
        ...args,
        branchName: child,
        indentLevel:
          args.indentLevel + (args.reverse ? children.length - i - 1 : i),
      },
      context
    )
  );
}

function printBranch(args: TPrintStackArgs, context: TContext) {
  // `gt log short` case
  if (args.short) {
    context.splog.logInfo(
      `${'  '.repeat(args.indentLevel)}${displayBranchName(
        args.branchName,
        context
      )}`
    );
    return;
  }

  // `gt log` case

  const numChildren = context.metaCache.getChildren(args.branchName).length;

  // In reverse mode, we print the info before the branching line
  // Don't print the stem next to this section if there are no children
  if (args.reverse) {
    printInfoLines({ ...args, noStem: numChildren === 0 }, context);
  }

  // Print branching line
  if (numChildren) {
    context.splog.logInfo(
      getPrefix(args.indentLevel) +
        getBranchingLine({
          numChildren,
          reverse: args.reverse,
        })
    );
  }

  // In standard (non-reverse) mode, we print the info after the branching line
  if (!args.reverse) {
    printInfoLines(args, context);
  }
}

function getBranchingLine(args: {
  numChildren: number;
  reverse: boolean;
}): string | undefined {
  if (!args.numChildren) {
    return undefined;
  }
  const [middleBranch, lastBranch] = args.reverse
    ? ['──┬', '──┐']
    : ['──┴', '──┘'];

  const newBranchOffshoots = '│'.concat(
    middleBranch.repeat(args.numChildren > 2 ? args.numChildren - 2 : 0),
    args.numChildren > 1 ? lastBranch : ''
  );
  return newBranchOffshoots;
}

function printInfoLines(
  args: Omit<TPrintStackArgs, 'short'> & { noStem?: boolean },
  context: TContext
) {
  const isCurrent = args.branchName === context.metaCache.currentBranch;
  getBranchInfo(
    {
      branchName: args.branchName,
      displayAsCurrent: isCurrent,
      showCommitNames: args.reverse ? 'REVERSE' : 'STANDARD',
    },
    context
  ).forEach((line, index) =>
    context.splog.logInfo(
      `${getPrefix(args.indentLevel)}${
        index === 0
          ? isCurrent
            ? chalk.cyan('◉')
            : '◯'
          : args.noStem
          ? ' '
          : '│'
      } ${line}`
    )
  );

  context.splog.logInfo(
    getPrefix(args.indentLevel) + (args.noStem ? ' ' : '│')
  );
}

function getPrefix(indentLevel: number) {
  return '│  '.repeat(indentLevel);
}
