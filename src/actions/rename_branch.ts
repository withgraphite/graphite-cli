import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { ExitFailedError, KilledError } from '../lib/errors';
import { replaceUnsupportedCharacters } from '../lib/utils/branch_name';

async function getNewBranchName(
  context: TContext,
  oldBranchName: string
): Promise<string> {
  context.splog.info(`Enter new name for ${chalk.blueBright(oldBranchName)}:`);

  const response = await prompts(
    {
      type: 'text',
      name: 'branchName',
      message: 'Branch Name',
      initial: oldBranchName,
      validate: (name) => {
        const calculatedName = replaceUnsupportedCharacters(name, context);
        return oldBranchName !== calculatedName &&
          context.metaCache.allBranchNames.includes(calculatedName)
          ? 'Branch name is unavailable.'
          : true;
      },
    },
    {
      onCancel: () => {
        throw new KilledError();
      },
    }
  );

  return response.branchName;
}

export async function renameCurrentBranch(
  args: { newBranchName?: string; force?: boolean },
  context: TContext
): Promise<void> {
  const oldBranchName = context.metaCache.currentBranchPrecondition;

  const branchName =
    context.interactive && args.newBranchName
      ? args.newBranchName
      : await getNewBranchName(context, oldBranchName);

  if (oldBranchName === branchName) {
    context.splog.info(
      `Current branch is already named ${chalk.cyan(oldBranchName)}`
    );
    return;
  }

  if (context.metaCache.getPrInfo(oldBranchName)?.number && !args.force) {
    context.splog.tip(
      `Renaming a branch that is already associated with a PR removes the association.`
    );

    throw new ExitFailedError(
      'Renaming a branch for a submitted PR requires the `--force` option'
    );
  }

  const newBranchName = replaceUnsupportedCharacters(branchName, context);

  context.metaCache.renameCurrentBranch(newBranchName);
  context.splog.info(
    `Successfully renamed ${chalk.blueBright(oldBranchName)} to ${chalk.green(
      newBranchName
    )}`
  );
}
