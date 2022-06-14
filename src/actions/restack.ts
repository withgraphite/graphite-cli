import chalk from 'chalk';
import { TContext } from '../lib/context';
import { RebaseConflictError } from '../lib/errors';
import { assertUnreachable } from '../lib/utils/assert_unreachable';
import { persistContinuation } from './persist_continuation';
import { printConflictStatus } from './print_conflict_status';

export function restackBranches(
  branchNames: string[],
  context: TContext
): void {
  context.splog.debug(
    branchNames.reduce((acc, curr) => `${acc}\n${curr}`, 'RESTACKING:')
  );
  while (branchNames.length > 0) {
    const branchName = branchNames.shift() as string;

    if (context.metaCache.isTrunk(branchName)) {
      context.splog.info(
        `${chalk.cyan(branchName)} does not need to be restacked.`
      );
      continue;
    }

    const result = context.metaCache.restackBranch(branchName);
    context.splog.debug(`${result}: ${branchName}`);
    switch (result.result) {
      case 'REBASE_DONE':
        context.splog.info(
          `Restacked ${chalk.green(branchName)} on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}.`
        );
        continue;

      case 'REBASE_CONFLICT':
        persistContinuation(
          {
            branchesToRestack: branchNames,
            rebasedBranchBase: result.rebasedBranchBase,
          },
          context
        );
        printConflictStatus(
          `Hit conflict restacking ${chalk.yellow(branchName)} on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}.`,
          context
        );
        throw new RebaseConflictError();

      case 'REBASE_UNNEEDED':
        context.splog.info(
          `${chalk.cyan(
            branchName
          )} does not need to be restacked${` on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}`}.`
        );
        continue;

      default:
        assertUnreachable(result);
    }
  }
}
