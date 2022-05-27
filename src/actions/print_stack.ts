import chalk from 'chalk';
import { TContext } from '../lib/context';
import { getBranchInfo } from './show_branch';

export function printStack(
  args: {
    branchName: string;
    indentLevel: number;
  },
  context: TContext
): void {
  const children = context.metaCache.getChildren(args.branchName);
  const currPrefix = '│  '.repeat(args.indentLevel);

  children.forEach((child, i) => {
    printStack(
      {
        branchName: child,
        indentLevel: args.indentLevel + i,
      },
      context
    );
  });

  // 1) if there is only 1 child, we only need to continue the parent's stem
  // 2) if there are multiple children, the 2..n children branch off
  //    horizontally
  const numChildren = children.length;
  if (numChildren > 1) {
    let newBranchOffshoots = '│';
    // we only need to draw numChildren - 1 offshots since the first child
    // continues the parent's main stem
    for (let i = 1; i < numChildren; i++) {
      if (i < numChildren - 1) {
        newBranchOffshoots += '──┴';
      } else {
        newBranchOffshoots += '──┘';
      }
    }
    context.splog.logInfo(currPrefix + newBranchOffshoots);
    context.splog.logInfo(currPrefix + '│');
  }

  // print lines of branch info
  const isCurrent = args.branchName === context.metaCache.currentBranch;
  getBranchInfo(
    {
      branchName: args.branchName,
      displayAsCurrent: isCurrent,
      showCommitNames: true,
    },
    context
  )
    .map((line, index) =>
      index === 0 ? `${isCurrent ? chalk.cyan('◉') : '◯'} ${line}` : `│ ${line}`
    )
    .forEach((line) => context.splog.logInfo(currPrefix + line));

  // print trailing stem
  // note: stem directly behind trunk should be dotted
  context.splog.logInfo(
    currPrefix + (context.metaCache.isTrunk(args.branchName) ? '․' : '│')
  );
}
