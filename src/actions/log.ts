import chalk from 'chalk';
import { TContext } from '../lib/context';
import { displayBranchName } from './display_branches';
import { getBranchInfo } from './show_branch';

export function logAction(
  opts: { style: 'SHORT' | 'FULL'; reverse: boolean },
  context: TContext
): void {
  getStackLines(
    {
      short: opts.style === 'SHORT',
      reverse: opts.reverse,
      branchName: context.metaCache.trunk,
      indentLevel: 0,
    },
    context
  ).forEach((line) => context.splog.logInfo(line));

  if (opts.style === 'SHORT' && !opts.reverse) {
    context.splog.logTip(
      'Miss the old version of log short? Try the --classic flag!'
    );
  }
}

type TPrintStackArgs = {
  short: boolean;
  reverse: boolean;
  branchName: string;
  indentLevel: number;
};

function getStackLines(args: TPrintStackArgs, context: TContext): string[] {
  const outputDeep = [
    getChildrenLines(args, context),
    getBranchLines(args, context),
  ];

  return args.reverse ? outputDeep.reverse().flat() : outputDeep.flat();
}

function getChildrenLines(args: TPrintStackArgs, context: TContext): string[] {
  const children = context.metaCache.getChildren(args.branchName);
  return children.flatMap((child, i) =>
    getStackLines(
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

function getBranchLines(args: TPrintStackArgs, context: TContext): string[] {
  // `gt log short` case
  if (args.short) {
    return [
      `${'  '.repeat(args.indentLevel)}${displayBranchName(
        args.branchName,
        context
      )}`,
    ];
  }

  // `gt log` case
  const numChildren = context.metaCache.getChildren(args.branchName).length;

  const outputDeep = [
    getBranchingLine({
      numChildren,
      reverse: args.reverse,
      indentLevel: args.indentLevel,
    }),
    getInfoLines(
      { ...args, noStem: args.reverse && numChildren === 0 },
      context
    ),
  ];

  return args.reverse ? outputDeep.reverse().flat() : outputDeep.flat();
}

function getBranchingLine(args: {
  numChildren: number;
  reverse: boolean;
  indentLevel: number;
}): string[] {
  // return type is array so that we don't add lines to the output in the empty case
  if (args.numChildren < 2) {
    return [];
  }
  const [middleBranch, lastBranch] = args.reverse
    ? ['──┬', '──┐']
    : ['──┴', '──┘'];

  return [
    getPrefix(args.indentLevel) +
      '├'.concat(
        middleBranch.repeat(args.numChildren > 2 ? args.numChildren - 2 : 0),
        lastBranch
      ),
  ];
}

function getInfoLines(
  args: Omit<TPrintStackArgs, 'short'> & { noStem?: boolean },
  context: TContext
): string[] {
  const isCurrent = args.branchName === context.metaCache.currentBranch;
  return getBranchInfo(
    {
      branchName: args.branchName,
      displayAsCurrent: isCurrent,
      showCommitNames: args.reverse ? 'REVERSE' : 'STANDARD',
    },
    context
  )
    .map(
      (line, index) =>
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
    .concat([getPrefix(args.indentLevel) + (args.noStem ? ' ' : '│')]);
}

function getPrefix(indentLevel: number): string {
  return '│  '.repeat(indentLevel);
}
