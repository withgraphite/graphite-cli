import prompts from 'prompts';
import { TContext } from '../lib/context/context';
import { ExitCancelledError } from '../lib/errors';
import { getTrunk } from '../lib/utils';
import { MetaStackBuilder } from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';

export async function interactiveBranchSelection(
  context: TContext,
  opts: { message: string; omitCurrentUpstack?: boolean }
): Promise<string> {
  const currentBranch = Branch.getCurrentBranch();

  const stack = new MetaStackBuilder().fullStackFromBranch(
    getTrunk(context),
    context
  );

  const choices = stack.toPromptChoices(
    opts?.omitCurrentUpstack ? currentBranch?.name : undefined
  );

  const initialBranchName = currentBranch
    ? opts?.omitCurrentUpstack
      ? currentBranch.getParentBranchName() ?? ''
      : currentBranch.name
    : undefined;

  const initial = initialBranchName
    ? choices.map((c) => c.value).indexOf(initialBranchName)
    : undefined;

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

  return chosenBranch;
}
