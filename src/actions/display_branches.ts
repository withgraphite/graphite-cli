import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitCancelledError } from '../lib/errors';

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
    display: `${'  '.repeat(opts.indent ?? 0)}↱ ${
      opts.branchName === currentBranchName && opts.highlightCurrentBranch
        ? chalk.cyan(opts.branchName)
        : opts.branchName
    } ${
      context.metaCache.isBranchFixed(opts.branchName)
        ? ''
        : chalk.yellowBright(`(needs restack)`)
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

export function logShortAction(context: TContext): void {
  context.splog.logInfo(
    displayBranchesInternal(
      { branchName: context.metaCache.trunk, highlightCurrentBranch: true },
      context
    )
      .map((b) => b.display)
      .join('\n')
  );
}

export async function interactiveBranchSelection(
  opts: { message: string; omitCurrentBranch?: boolean },
  context: TContext
): Promise<string> {
  const choices = displayBranchesInternal(
    {
      branchName: context.metaCache.trunk,
      omitCurrentBranch: opts.omitCurrentBranch,
    },
    context
  ).map((choice) => ({ title: choice.display, value: choice.branchName }));

  const indexOfCurrentIfPresent = choices.findIndex(
    (choice) =>
      choice.value ===
      (opts.omitCurrentBranch
        ? context.metaCache.getParent(
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
        type: 'select',
        name: 'branch',
        message: opts.message,
        choices,
        initial,
      },
      {
        onCancel: () => {
          throw new ExitCancelledError('No branch selected');
        },
      }
    )
  ).branch;

  context.splog.logDebug(`Selected ${chosenBranch}`);
  return chosenBranch;
}
