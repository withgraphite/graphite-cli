import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitCancelledError } from '../lib/errors';
import { getTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';
import { MetaStackBuilder } from '../wrapper-classes/meta_stack_builder';

export async function interactiveBranchSelection(
  context: TContext,
  opts: { message: string; omitCurrentUpstack?: boolean }
): Promise<string> {
  const currentBranch = Branch.currentBranch();
  const trunk = getTrunk(context);

  const stack = new MetaStackBuilder().fullStackFromBranch(trunk, context);

  const choices = stack.toPromptChoices(
    opts?.omitCurrentUpstack ? currentBranch?.name : undefined
  );

  const indexOfCurrentIfPresent = choices.findIndex(
    (choice) =>
      choice.value ===
      (opts?.omitCurrentUpstack
        ? currentBranch?.getParentBranchName()
        : currentBranch?.name)
  );

  const initial =
    indexOfCurrentIfPresent !== -1
      ? indexOfCurrentIfPresent
      : choices.findIndex((choice) => choice.value === trunk.name);

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
