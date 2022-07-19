import chalk from 'chalk';
import prompts from 'prompts';
import stripAnsi from 'strip-ansi';
import { GRAPHITE_COLORS } from '../lib/colors';
import { TContext } from '../lib/context';
import { KilledError } from '../lib/errors';
import { suggest } from '../lib/utils/prompts_helpers';
import { getBranchInfo } from './show_branch';

export function logAction(
  opts: {
    style: 'SHORT' | 'FULL';
    reverse: boolean;
    steps: number | undefined;
    branchName: string;
  },
  context: TContext
): void {
  getStackLines(
    {
      short: opts.style === 'SHORT',
      reverse: opts.reverse,
      branchName: opts.branchName,
      indentLevel: 0,
      steps: opts.steps,
    },
    context
  ).forEach((line) => context.splog.info(line));

  if (
    opts.style === 'SHORT' &&
    context.metaCache.isTrunk(opts.branchName) &&
    !opts.reverse &&
    !opts.steps
  ) {
    context.splog.tip(
      'Miss the old version of log short? Try the `--classic` flag!'
    );
  }
}

export function logForConflictStatus(
  rebaseHead: string,
  context: TContext
): void {
  getStackLines(
    {
      short: true,
      reverse: false,
      branchName: rebaseHead,
      indentLevel: 0,
      steps: 1,
      noStyleBranchName: true,
    },
    context
  ).forEach((line) => context.splog.info(line));
}

export async function interactiveBranchSelection(
  opts: {
    message: string;
    omitCurrentBranch?: boolean;
    showUntracked?: boolean;
  },
  context: TContext
): Promise<string> {
  const choices = getStackLines(
    {
      short: true,
      reverse: false,
      branchName: context.metaCache.trunk,
      indentLevel: 0,
      omitCurrentBranch: opts.omitCurrentBranch,
      noStyleBranchName: true,
    },
    context
  )
    .map((stackLine) => ({
      title: stackLine,
      value: ((stackLine) =>
        stackLine.substring(stackLine.lastIndexOf('  ') + 2))(
        stripAnsi(stackLine)
      ),
    }))
    .concat(
      context.metaCache.allBranchNames
        .filter(
          (branchName) =>
            !context.metaCache.isTrunk(branchName) &&
            !context.metaCache.isBranchTracked(branchName)
        )
        .map((branchName) => ({ title: branchName, value: branchName }))
    );

  const indexOfCurrentIfPresent = choices.findIndex(
    (choice) =>
      choice.value ===
      (opts.omitCurrentBranch
        ? context.metaCache.getParentPrecondition(
            context.metaCache.currentBranchPrecondition
          )
        : context.metaCache.currentBranch)
  );

  const initial =
    indexOfCurrentIfPresent !== -1
      ? indexOfCurrentIfPresent
      : choices.length - 1;

  const chosenBranch = (
    await prompts(
      {
        type: 'autocomplete',
        name: 'branch',
        message: opts.message,
        choices,
        initial,
        suggest,
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    )
  ).branch;

  context.splog.debug(`Selected ${chosenBranch}`);
  return chosenBranch;
}

type TPrintStackArgs = {
  short: boolean;
  reverse: boolean;
  branchName: string;
  indentLevel: number;
  omitCurrentBranch?: boolean;
  noStyleBranchName?: boolean; // Currently only implemented for short = true
  steps?: number;
};

function getLogShortColor(toColor: string, index: number): string {
  return chalk.rgb(
    ...GRAPHITE_COLORS[Math.floor(index / 2) % GRAPHITE_COLORS.length]
  )(toColor);
}

function getStackLines(args: TPrintStackArgs, context: TContext): string[] {
  const overallIndent = { value: 0 };
  const outputDeep = [
    getUpstackExclusiveLines({ ...args, overallIndent }, context),
    getBranchLines(args, context),
    getDownstackExclusiveLines(args, context),
  ];

  return (args.reverse ? outputDeep.reverse().flat() : outputDeep.flat()).map(
    (line) => {
      if (!args.short) {
        return line;
      }
      // This lambda is for finalizing log short formatting
      const circleIndex = line.indexOf('◯');
      const arrowIndex = line.indexOf('▸');
      const branchNameAndDetails = line.slice(arrowIndex + 1);

      const replaceCircle =
        !args.noStyleBranchName &&
        context.metaCache.currentBranch &&
        branchNameAndDetails.split(' ')[0] === context.metaCache.currentBranch;

      return `${line
        .slice(0, arrowIndex)
        .split('')
        .map(getLogShortColor)
        .map((c) => (replaceCircle ? c.replace('◯', '◉') : c))
        .join('')}${' '.repeat(
        overallIndent.value * 2 + 3 - arrowIndex
      )}${getLogShortColor(line.slice(arrowIndex + 1), circleIndex)}`;
    }
  );
}

function getDownstackExclusiveLines(
  args: TPrintStackArgs,
  context: TContext
): string[] {
  if (context.metaCache.isTrunk(args.branchName)) {
    return [];
  }

  const outputDeep = [
    context.metaCache.trunk,
    ...context.metaCache.getRelativeStack(args.branchName, {
      recursiveParents: true,
    }),
  ]
    .slice(-(args.steps ?? 0))
    .map((branchName) =>
      // skip the branching line for downstack because we show 1 child per branch
      getBranchLines({ ...args, branchName, skipBranchingLine: true }, context)
    );

  // opposite of the rest of these because we got the list from trunk upward
  return args.reverse ? outputDeep.flat() : outputDeep.reverse().flat();
}

function getUpstackInclusiveLines(
  args: TPrintStackArgs & { overallIndent: { value: number } },
  context: TContext
): string[] {
  const outputDeep = [
    getUpstackExclusiveLines(args, context),
    getBranchLines(args, context),
  ];

  return args.reverse ? outputDeep.reverse().flat() : outputDeep.flat();
}

function getUpstackExclusiveLines(
  args: TPrintStackArgs & { overallIndent: { value: number } },
  context: TContext
): string[] {
  if (args.steps === 0) {
    return [];
  }
  const children = context.metaCache
    .getChildren(args.branchName)
    .filter(
      (child) =>
        !args.omitCurrentBranch ||
        child !== context.metaCache.currentBranchPrecondition
    );
  const numChildren = children.length;
  return children.flatMap((child, i) =>
    getUpstackInclusiveLines(
      {
        ...args,
        steps: args.steps ? args.steps - 1 : undefined,
        branchName: child,
        indentLevel:
          args.indentLevel + (args.reverse ? numChildren - i - 1 : i),
      },
      context
    )
  );
}

function getBranchLines(
  args: TPrintStackArgs & {
    overallIndent?: { value: number };
    skipBranchingLine?: boolean; // for standard
  },
  context: TContext
): string[] {
  const children = context.metaCache.getChildren(args.branchName);
  const numChildren =
    children.length -
    (args.omitCurrentBranch &&
    children.includes(context.metaCache.currentBranchPrecondition)
      ? 1
      : 0);

  if (args.overallIndent) {
    args.overallIndent.value = Math.max(
      args.overallIndent.value,
      args.indentLevel
    );
  }

  // `gt log short` case
  if (args.short) {
    return [
      `${'│ '.repeat(args.indentLevel)}${'◯'}${
        numChildren <= 2
          ? ''
          : (args.reverse ? '─┬' : '─┴').repeat(numChildren - 2)
      }${numChildren <= 1 ? '' : args.reverse ? '─┐' : '─┘'}▸${
        args.branchName
      }${
        args.noStyleBranchName ||
        context.metaCache.isBranchFixed(args.branchName)
          ? ''
          : chalk.yellowBright(` (needs restack)`)
      }`,
    ];
  }

  // `gt log` case
  const outputDeep = [
    args.skipBranchingLine
      ? []
      : getBranchingLine({
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
