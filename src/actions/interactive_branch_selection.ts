import prompts from 'prompts';
import { TContext } from '../lib/context/context';
import { ExitCancelledError } from '../lib/errors';
import { getTrunk } from '../lib/utils';
import { MetaStackBuilder } from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';

export async function interactiveBranchSelection(
  context: TContext
): Promise<string> {
  const stack = new MetaStackBuilder().fullStackFromBranch(
    getTrunk(context),
    context
  );
  return await promptBranches(stack.toPromptChoices());
}

type promptOptionT = { title: string; value: string };

async function promptBranches(choices: promptOptionT[]): Promise<string> {
  const currentBranch = Branch.getCurrentBranch();

  const currentBranchIndex = currentBranch
    ? choices.map((c) => c.value).indexOf(currentBranch.name)
    : undefined;

  const chosenBranch = (
    await prompts(
      {
        type: 'select',
        name: 'branch',
        message: `Checkout a branch`,
        choices: choices,
        ...(currentBranchIndex ? { initial: currentBranchIndex } : {}),
      },
      {
        onCancel: () => {
          return;
        },
      }
    )
  ).branch;

  if (!chosenBranch) {
    throw new ExitCancelledError('No branch selected');
  }

  return chosenBranch;
}
