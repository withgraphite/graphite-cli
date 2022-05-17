import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitCancelledError } from '../lib/errors';
import { logDebug } from '../lib/utils/splog';

function getPromptChoices(
  opts: {
    from: string;
    omit?: string;
    indent?: number;
  },
  context: TContext
): { title: string; value: string }[] {
  const currentChoice = {
    title: `${'  '.repeat(opts.indent ?? 0)}↱ (${opts.from})`,
    value: opts.from,
  };
  return (
    context.metaCache
      .getChildren(opts.from)
      ?.filter((b) => b !== opts.omit)
      .map((b) =>
        getPromptChoices(
          { from: b, omit: opts.omit, indent: (opts.indent ?? 0) + 1 },
          context
        )
      )
      .reduceRight((acc, arr) => arr.concat(acc), [currentChoice]) ?? []
  );
}

export async function interactiveBranchSelection(
  context: TContext,
  opts: { message: string; omitCurrentUpstack?: boolean }
): Promise<string> {
  const choices = getPromptChoices(
    {
      from: context.metaCache.trunk,
      omit: opts.omitCurrentUpstack
        ? context.metaCache.currentBranch
        : undefined,
    },
    context
  );
  const indexOfCurrentIfPresent = choices.findIndex(
    (choice) =>
      choice.value ===
      (opts.omitCurrentUpstack
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

  logDebug(`Selected ${chosenBranch}`);
  return chosenBranch;
}
