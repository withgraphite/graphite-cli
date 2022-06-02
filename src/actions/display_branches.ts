import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { KilledError } from '../lib/errors';

export function displayBranchName(
  branchName: string,
  context: TContext
): string {
  return `${
    branchName === context.metaCache.currentBranch
      ? chalk.cyan(branchName)
      : branchName
  } ${
    context.metaCache.isBranchFixed(branchName)
      ? ''
      : chalk.yellowBright(`(needs restack)`)
  }`;
}

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
    display: `${'  '.repeat(opts.indent ?? 0)}↱ ${displayBranchName(
      opts.branchName,
      context
    )}`,
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
        type: 'select',
        name: 'branch',
        message: opts.message,
        choices,
        initial,
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    )
  ).branch;

  context.splog.logDebug(`Selected ${chosenBranch}`);
  return chosenBranch;
}
