import chalk from 'chalk';
import { TContext } from '../lib/context';

function displayBranchesInternal(
  opts: {
    branchName: string;
    highlightCurrentBranch?: boolean;
    omitCurrentBranch?: boolean;
    indent?: number;
  },
  context: TContext
): { display: string; branchName: string }[] {
  const currentBranchName = context.metaCache.currentBranch;
  const currentChoice = {
    display: `${'  '.repeat(opts.indent ?? 0)}↱ $ ${opts.branchName}${
      context.metaCache.isBranchFixed(opts.branchName)
        ? ''
        : chalk.yellowBright(` (needs restack)`)
    }`,
    branchName: opts.branchName,
  };
  return (
    context.metaCache
      .getChildren(opts.branchName)
      ?.filter((b) => b !== currentBranchName || !opts.omitCurrentBranch)
      .map((b) =>
        displayBranchesInternal(
          {
            ...opts,
            branchName: b,
            indent: (opts.indent ?? 0) + 1,
          },
          context
        )
      )
      .reduceRight((acc, arr) => arr.concat(acc), [currentChoice]) ?? []
  );
}

export function logShortClassic(context: TContext): void {
  context.splog.info(
    displayBranchesInternal(
      { branchName: context.metaCache.trunk, highlightCurrentBranch: true },
      context
    )
      .map((b) => b.display)
      .join('\n')
  );
}
