import chalk from 'chalk';
import { getCommitterDate } from '../lib/utils';
import { getTrunk } from '../lib/utils/trunk';
import { Commit } from '../wrapper-classes';
import Branch from '../wrapper-classes/branch';
import { TBranchPRInfo } from '../wrapper-classes/metadata_ref';

type TPrintStackConfig = {
  currentBranch: Branch | null;
  offTrunk: boolean;
  visited: string[];
};

export function printStack(args: {
  baseBranch: Branch;
  indentLevel: number;
  config: TPrintStackConfig;
}): void {
  args.config.visited.push(args.baseBranch.name);

  const children = args.baseBranch.getChildrenFromGit();
  const currPrefix = getPrefix(args.indentLevel, args.config);

  /**
   * TODO(nicholasyan): we need to improve how we handle merges.
   *
   * C
   * |\
   * | B
   * |/
   * A
   *
   * For example in the above case, our logic will print the subtrees headed
   * by both B and C - which means that the subtree headed by C gets printed
   * twice.
   *
   * This is a short-term workaround to at least prevent duplicate printing
   * in the near-term: we mark already-visited nodes and make sure if we
   * hit an already-visited node, we just filter it out and skip it.
   */
  const unvisitedChildren = children.filter(
    (child) => !child.isTrunk() && !args.config.visited.includes(child.name)
  );
  unvisitedChildren.forEach((child, i) => {
    printStack({
      baseBranch: child,
      indentLevel: args.indentLevel + i,
      config: args.config,
    });
  });

  // 1) if there is only 1 child, we only need to continue the parent's stem
  // 2) if there are multiple children, the 2..n children branch off
  //    horizontally
  const numChildren = unvisitedChildren.length;
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
    console.log(currPrefix + newBranchOffshoots);
    console.log(currPrefix + '│');
  }

  // print lines of branch info
  const branchInfo = getBranchInfo(args.baseBranch, args.config);
  branchInfo.forEach((line) => console.log(currPrefix + line));

  // print trailing stem
  // note: stem directly behind trunk should be dotted
  console.log(
    currPrefix +
      (!args.config.offTrunk && args.baseBranch.name === getTrunk().name
        ? '․'
        : '│')
  );
}

function getPrefix(indentLevel: number, config: TPrintStackConfig): string {
  let prefix = '';
  for (let i = 0; i < indentLevel; i++) {
    // if we're behind trunk, the stem of trunk's branch should be dotted
    if (i === 0) {
      prefix += config.offTrunk ? '│  ' : '․  ';
    } else {
      prefix += '│  ';
    }
  }
  return prefix;
}

function getBranchInfo(branch: Branch, config: TPrintStackConfig): string[] {
  let branchInfoLines = [];

  branchInfoLines.push(getBranchTitle(branch, config));

  const prInfo = branch.getPRInfo();
  const prTitle = prInfo?.title;
  if (prTitle !== undefined) {
    branchInfoLines.push(prTitle);
  }

  branchInfoLines.push(
    `${chalk.dim(
      getCommitterDate({
        revision: branch.name,
        timeFormat: 'RELATIVE_READABLE',
      })
    )}`
  );

  if (!branch.isTrunk()) {
    const commits = branch.getNonEmptyCommitSHAs();
    if (commits.length !== 0) {
      commits.forEach((commitSHA) => {
        const commit = new Commit(commitSHA);
        branchInfoLines.push(
          chalk.gray(`* ${commit.sha.slice(0, 6)} - ${commit.messageSubject()}`)
        );
      });
    }
  }

  branchInfoLines = dimMergedOrClosedBranches({
    lines: branchInfoLines,
    branch: branch,
  });

  branchInfoLines = prefixWithBranchStem({
    branch: branch,
    config: config,
    lines: branchInfoLines,
  });

  return branchInfoLines;
}

export function getBranchTitle(
  branch: Branch,
  config: TPrintStackConfig
): string {
  const prInfo = branch.getPRInfo();
  const branchName =
    config.currentBranch?.name === branch.name
      ? chalk.cyan(`${branch.name} (current)`)
      : branch.name;
  const prNumber = prInfo !== undefined ? `PR #${prInfo.number}` : '';

  if (prInfo?.state === 'MERGED') {
    return `${branchName} ${prNumber} ${getPRState(prInfo) ?? ''}`;
  } else if (prInfo?.state === 'CLOSED') {
    return `${chalk.strikethrough(`${branchName} ${prNumber}`)} ${
      getPRState(prInfo) ?? ''
    }`;
  } else {
    return `${chalk.blueBright(branchName)} ${chalk.yellow(prNumber)} ${
      getPRState(prInfo) ?? ''
    }`;
  }
}

function getPRState(prInfo: TBranchPRInfo | undefined): string | undefined {
  if (prInfo === undefined) {
    return '';
  }

  if (prInfo.state === undefined && prInfo.reviewDecision === undefined) {
    return chalk.dim('Syncing PR Info...');
  }

  if (getMergedOrClosed(prInfo)) {
    switch (prInfo.state) {
      case 'CLOSED':
        return chalk.gray('(Abandoned)');
      case 'MERGED':
        return chalk.gray('(Merged)');
      default:
      // Intentional fallthrough - if not closed/merged, we want to display
      // the current review status.
    }
  }

  if (prInfo.isDraft) {
    return chalk.gray('(Draft)');
  }

  const reviewDecision = prInfo.reviewDecision;
  switch (reviewDecision) {
    case 'APPROVED':
      return chalk.green('(Approved)');
    case 'CHANGES_REQUESTED':
      return chalk.magenta('(Changes Requested)');
    case 'REVIEW_REQUIRED':
      return chalk.yellow('(Review Required)');
    default:
    // Intentional fallthrough - if there's no review decision, that means that
    // review isn't required and we can skip displaying a review status.
  }

  return '';
}

/**
 * Prefixes a set of lines with the appropriate branch stem.
 *
 * Before:
 * [
 *  "foo",
 *  "bar",
 *  "baz",
 * ]
 *
 * After:
 * [
 *  "◉ foo",
 *  "│ bar",
 *  "│ baz",
 * ]
 *
 */

function prefixWithBranchStem(args: {
  lines: string[];
  branch: Branch;
  config: TPrintStackConfig;
}): string[] {
  const isCurrentBranch = args.config.currentBranch?.name === args.branch.name;
  const dot = isCurrentBranch ? chalk.cyan('◉') : '◯';
  return args.lines.map((line, index) =>
    index === 0 ? `${dot} ${line}` : `│ ${line}`
  );
}

function dimMergedOrClosedBranches(args: {
  lines: string[];
  branch: Branch;
}): string[] {
  const isBranchMergedOrClosed = getMergedOrClosed(args.branch.getPRInfo());
  if (isBranchMergedOrClosed) {
    return args.lines.map((line) => chalk.dim.gray(line));
  }
  return args.lines;
}

function getMergedOrClosed(prInfo: TBranchPRInfo | undefined): boolean {
  const state = prInfo?.state;
  return state === 'MERGED' || state === 'CLOSED';
}
