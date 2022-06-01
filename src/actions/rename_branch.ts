import chalk from 'chalk';
import { TContext } from '../lib/context';
import { ExitFailedError } from '../lib/errors';
import { replaceUnsupportedCharacters } from '../lib/utils/branch_name';

export function renameCurrentBranch(
  args: { newBranchName: string; force?: boolean },
  context: TContext
): void {
  const oldBranchName = context.metaCache.currentBranchPrecondition;
  if (context.metaCache.getPrInfo(oldBranchName)?.number && !args.force) {
    context.splog.logTip(
      `Renaming a branch that is already associated with a PR removes the association.`
    );

    throw new ExitFailedError(
      'Renaming a branch for a submitted PR requires the `--force` option'
    );
  }

  const newBranchName = replaceUnsupportedCharacters(
    args.newBranchName,
    context
  );

  context.metaCache.renameCurrentBranch(newBranchName);
  context.splog.logInfo(
    `Successfully renamed (${chalk.cyan(oldBranchName)}) to (${chalk.green(
      newBranchName
    )})`
  );
}
