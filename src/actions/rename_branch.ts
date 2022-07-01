import chalk from 'chalk';
import { TContext } from '../lib/context';
import { ExitFailedError } from '../lib/errors';
import { replaceUnsupportedCharacters } from '../lib/utils/branch_name';

function getNewBranchName(context: TContext, oldBranchName: string): string {
  console.log(context);
  console.log(oldBranchName);

  // context.splog.newline();
  // context.splog.info(
  //   `Enter new name for branch
  //   )} ▸ ${chalk.blueBright(args.branchName)}:`
  // );

  return 'new branch name';
}

export function renameCurrentBranch(
  args: { newBranchName?: string; force?: boolean },
  context: TContext
): void {
  const oldBranchName = context.metaCache.currentBranchPrecondition;

  const branchName =
    context.interactive && args.newBranchName
      ? args.newBranchName
      : getNewBranchName(context, oldBranchName);

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
