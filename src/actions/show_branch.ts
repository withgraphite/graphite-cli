import chalk from 'chalk';
import { TContext } from '../lib/context';
import { TBranchPRInfo } from '../lib/engine/metadata_ref';
import { showDiff } from '../lib/git/diff';
import { showCommits } from '../lib/git/show_commits';

export async function showBranchAction(
  branchName: string,
  opts: { patch: boolean; diff: boolean; body: boolean },
  context: TContext
): Promise<void> {
  const output = getBranchInfo({ branchName }, context);

  const parentBranchName = context.metaCache.getParent(branchName);
  if (parentBranchName) {
    output.push(`${chalk.cyan('Parent')}: ${parentBranchName}`);
  }

  const children = context.metaCache.getChildren(branchName);
  if (children.length) {
    output.push(`${chalk.cyan('Children')}:`);
    output.concat(children.map((c) => `▸ ${c}`));
  }

  const body = opts.body && context.metaCache.getPrInfo(branchName)?.body;
  if (body) {
    output.push('');
    output.push(body);
  }

  output.push('');
  output.push(
    showCommits(
      context.metaCache.isTrunk(branchName)
        ? `${branchName}~`
        : context.metaCache.getBaseRevision(branchName),
      branchName,
      opts.patch && !opts.diff
    )
  );

  if (opts.diff) {
    output.push('');
    output.push(
      showDiff(
        context.metaCache.isTrunk(branchName)
          ? `${branchName}~`
          : context.metaCache.getBaseRevision(branchName),
        branchName
      )
    );
  }

  context.splog.page(output.join('\n'));
}

export function getBranchInfo(
  args: {
    branchName: string;
    displayAsCurrent?: boolean;
    showCommitNames?: 'STANDARD' | 'REVERSE';
  },
  context: TContext
): string[] {
  const prInfo = context.metaCache.isTrunk(args.branchName)
    ? undefined
    : context.metaCache.getPrInfo(args.branchName);

  const prTitleLine = getPRTitleLine(prInfo);
  const branchInfoLines = [
    `${
      args.displayAsCurrent
        ? chalk.cyan(`${args.branchName} (current)`)
        : chalk.blueBright(args.branchName)
    } ${
      context.metaCache.isBranchFixed(args.branchName)
        ? ''
        : chalk.yellow(`(needs restack)`)
    }`,
    `${chalk.dim(
      context.metaCache.getAllCommits(args.branchName, 'COMMITTER_DATE')[0] ??
        ''
    )}`,
    ...(prTitleLine ? ['', prTitleLine] : []),
    ...(prInfo?.url ? [chalk.magenta(prInfo.url)] : []),
    '',
    ...(args.showCommitNames
      ? getCommitLines(
          args.branchName,
          args.showCommitNames === 'REVERSE',
          context
        )
      : []),
  ];

  return prInfo?.state === 'MERGED' || prInfo?.state === 'CLOSED'
    ? branchInfoLines.map((line) => chalk.dim.gray(line))
    : branchInfoLines;
}

function getPRTitleLine(prInfo: TBranchPRInfo | undefined): string | undefined {
  if (!prInfo?.title || !prInfo?.number) {
    return undefined;
  }
  const prNumber = `PR #${prInfo.number}`;

  if (prInfo?.state === 'MERGED') {
    return `${prNumber} (Merged) ${prInfo.title}`;
  } else if (prInfo?.state === 'CLOSED') {
    return `${prNumber} (Abandoned) ${chalk.strikethrough(`${prInfo.title}`)}`;
  } else {
    return `${chalk.yellow(prNumber)} ${getPRState(prInfo)} ${prInfo.title}`;
  }
}

function getPRState(prInfo: TBranchPRInfo | undefined): string {
  if (prInfo === undefined) {
    return '';
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
      return '';
  }
}

function getCommitLines(
  branchName: string,
  reverse: boolean,
  context: TContext
) {
  const lines = context.metaCache
    .getAllCommits(branchName, 'READABLE')
    .map((line) => chalk.gray(line));

  return reverse ? lines.reverse() : lines;
}
