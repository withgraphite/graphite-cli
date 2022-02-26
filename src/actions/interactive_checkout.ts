import prompts from 'prompts';
import { TContext } from '../lib/context/context';
import { ExitCancelledError, ExitFailedError } from '../lib/errors';
import { getTrunk, gpExecSync } from '../lib/utils';
import { MetaStackBuilder } from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';

export async function interactiveCheckout(context: TContext): Promise<void> {
  const stack = new MetaStackBuilder().fullStackFromBranch(
    getTrunk(context),
    context
  );
  await promptBranches(stack.toPromptChoices());
}

type promptOptionT = { title: string; value: string };

async function promptBranches(choices: promptOptionT[]): Promise<void> {
  const currentBranch = Branch.getCurrentBranch();
  let currentBranchIndex: undefined | number = undefined;

  if (currentBranch) {
    currentBranchIndex = choices
      .map((c) => c.value)
      .indexOf(currentBranch.name);
  }

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

  if (chosenBranch && chosenBranch !== currentBranch?.name) {
    gpExecSync({ command: `git checkout ${chosenBranch}` }, (err) => {
      throw new ExitFailedError(`Failed to checkout ${chosenBranch}`, err);
    });
  }
}
