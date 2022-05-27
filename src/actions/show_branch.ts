import chalk from 'chalk';
import { TContext } from '../lib/context';
import { getCommitterDate } from '../lib/git/committer_date';
import { showCommits } from '../lib/git/show_commits';
import { TBranchPRInfo } from '../lib/state/metadata_ref';

export async function showBranchAction(
  branchName: string,
  opts: { patch: boolean },
  context: TContext
): Promise<void> {
  context.splog.logInfo(getBranchInfo({ branchName }, context).join('\n'));

  const parentBranchName = context.metaCache.getParent(branchName);
  if (parentBranchName) {
    context.splog.logInfo(`${chalk.cyan('Parent')}: ${parentBranchName}`);
  }

  const children = context.metaCache.getChildren(branchName);
  if (children.length) {
    context.splog.logInfo(
      `${chalk.cyan('Children')}:\n${children.map((c) => `→ ${c}`).join('\n')}`
    );
  }

  if (context.metaCache.isTrunk(branchName)) {
    return;
  }
  context.splog.logNewline();
  showCommits(
    context.metaCache.getBaseRevision(branchName),
    branchName,
    opts.patch
  );
}

export function getBranchInfo(
  args: {
    branchName: string;
    displayAsCurrent?: boolean;
    showCommitNames?: boolean;
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
      getCommitterDate({
        revision: args.branchName,
        timeFormat: 'RELATIVE_READABLE',
      })
    )}`,
    ...(prTitleLine ? ['', prTitleLine] : []),
    ...(prInfo?.url ? [chalk.cyanBright(prInfo.url)] : []),
    ...(!args.showCommitNames || context.metaCache.isTrunk(args.branchName)
      ? ['']
      : [
          '',
          ...context.metaCache
            .getAllCommits(args.branchName, 'READABLE')
            .map((line) => chalk.gray(line)),
        ]),
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
