import chalk from 'chalk';
import { persistBranchesToRestack } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import { RebaseConflictError } from '../lib/errors';
import { assertUnreachable } from '../lib/utils/assert_unreachable';
import { logInfo } from '../lib/utils/splog';

export function restackCurrentBranch(context: TContext): void {
  restackBranches([context.metaCache.currentBranchPrecondition], context);
}

export function restackCurrentUpstack(context: TContext): void {
  const currentBranch = context.metaCache.currentBranchPrecondition;
  restackBranches(
    [currentBranch, ...context.metaCache.getRecursiveChildren(currentBranch)],
    context
  );
}

export function restackCurrentUpstackExclusive(context: TContext): void {
  restackBranches(
    context.metaCache.getRecursiveChildren(
      context.metaCache.currentBranchPrecondition
    ),
    context
  );
}

export function restackBranches(
  branchNames: string[],
  context: TContext
): void {
  while (branchNames.length > 0) {
    const branchName = branchNames.shift() as string;

    if (context.metaCache.isTrunk(branchName)) {
      logInfo(`${chalk.cyan(branchName)} does not need to be restacked.`);
      continue;
    }

    const result = context.metaCache.restackBranch(branchName);
    switch (result) {
      case 'REBASE_DONE':
        finishRestack(context);
        continue;

      case 'REBASE_CONFLICT':
        persistBranchesToRestack(branchNames, context);
        throw new RebaseConflictError(
          `Hit conflict restacking ${chalk.yellow(branchName)} on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}.`
        );

      case 'REBASE_UNNEEDED':
        logInfo(
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

export function finishRestack(context: TContext): void {
  const branchName = context.metaCache.currentBranchPrecondition;
  logInfo(
    `Restacked ${chalk.green(branchName)} on ${chalk.cyan(
      context.metaCache.getParentPrecondition(branchName)
    )}.`
  );
}
