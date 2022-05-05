import prompts from 'prompts';
import { TContext } from '../lib/context/context';
import { ExitCancelledError } from '../lib/errors';
import { logDebug } from '../lib/utils/splog';
import { getTrunk } from '../lib/utils/trunk';
import { MetaStackBuilder } from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';

export async function interactiveBranchSelection(
  context: TContext,
  opts: { message: string; omitCurrentUpstack?: boolean }
): Promise<string> {
  const currentBranch = Branch.getCurrentBranch();
  const trunk = getTrunk(context);

  const stack = new MetaStackBuilder().fullStackFromBranch(trunk, context);

  const choices = stack.toPromptChoices(
    opts?.omitCurrentUpstack ? currentBranch?.name : undefined
  );

  const initialBranchName =
    currentBranch && currentBranch.name in stack.branches
      ? opts?.omitCurrentUpstack
        ? currentBranch.getParentBranchName() ?? trunk.name
        : currentBranch.name
      : trunk.name;

  const initial = choices.map((c) => c.value).indexOf(initialBranchName);

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
