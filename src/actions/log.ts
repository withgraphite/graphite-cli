import chalk from 'chalk';
import { TContext } from '../lib/context';
import { displayBranchName } from './display_branches';
import { getBranchInfo } from './show_branch';

export function logAction(style: 'SHORT' | 'FULL', context: TContext): void {
  printStack(
    {
      short: style === 'SHORT',
      branchName: context.metaCache.trunk,
      indentLevel: 0,
    },
    context
  );
}

export function printStack(
  args: {
    short: boolean;
    branchName: string;
    indentLevel: number;
  },
  context: TContext
): void {
  const children = context.metaCache.getChildren(args.branchName);
  const currPrefix = (args.short ? '  ' : '│  ').repeat(args.indentLevel);

  children.forEach((child, i) => {
    printStack(
      {
        short: args.short,
        branchName: child,
        indentLevel: args.indentLevel + i,
      },
      context
    );
  });

  if (!args.short) {
    printBranchingLine(currPrefix, children.length, context);
    printInfoLines(currPrefix, args.branchName, context);
  }

  context.splog.logInfo(
    `${currPrefix}${displayBranchName(args.branchName, context)}`
  );
  if (context.metaCache.isTrunk(args.branchName)) {
    context.splog.logTip(
      'Miss the old version of log short? Try the --classic flag!'
    );
  }
}

function printBranchingLine(
  currPrefix: string,
  numChildren: number,
  context: TContext
) {
  if (!numChildren) {
    return;
  }
  const newBranchOffshoots = '│'.concat(
    '──┴'.repeat(numChildren > 2 ? numChildren - 2 : 0),
    numChildren > 1 ? '──┘' : ''
  );
  context.splog.logInfo(currPrefix + newBranchOffshoots);
}

function printInfoLines(
  currPrefix: string,
  branchName: string,
  context: TContext
) {
  const isCurrent = branchName === context.metaCache.currentBranch;
  getBranchInfo(
    {
      branchName: branchName,
      displayAsCurrent: isCurrent,
      showCommitNames: true,
    },
    context
  )
    .map((line, index) =>
      index === 0 ? `${isCurrent ? chalk.cyan('◉') : '◯'} ${line}` : `│ ${line}`
    )
    .forEach((line) => context.splog.logInfo(currPrefix + line));

  context.splog.logInfo(currPrefix + '│');
}
