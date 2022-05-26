import chalk from 'chalk';
import { persistBranchesToRestack } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import { RebaseConflictError } from '../lib/errors';
import { assertUnreachable } from '../lib/utils/assert_unreachable';

export function restackCurrentBranch(context: TContext): void {
  restackBranches([context.metaCache.currentBranchPrecondition], context);
}

export function restackCurrentDownstack(context: TContext): void {
  const currentBranch = context.metaCache.currentBranchPrecondition;
  restackBranches(
    [...context.metaCache.getRecursiveParents(currentBranch), currentBranch],
    context
  );
}

export function restackCurrentStack(context: TContext): void {
  const currentBranch = context.metaCache.currentBranchPrecondition;
  restackBranches(
    [
      ...context.metaCache.getRecursiveParents(currentBranch),
      currentBranch,
      ...context.metaCache.getRecursiveChildren(currentBranch),
    ],
    context
  );
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
  context.splog.logDebug(
    branchNames.reduce((cur, next) => `${cur}\n${next}`, 'RESTACKING:')
  );
  while (branchNames.length > 0) {
    const branchName = branchNames.shift() as string;

    if (context.metaCache.isTrunk(branchName)) {
      context.splog.logInfo(
        `${chalk.cyan(branchName)} does not need to be restacked.`
      );
      continue;
    }

    const result = context.metaCache.restackBranch(branchName);
    context.splog.logDebug(`${result}: ${branchName}`);
    switch (result) {
      case 'REBASE_DONE':
        context.splog.logInfo(
          `Restacked ${chalk.green(branchName)} on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}.`
        );
        continue;

      case 'REBASE_CONFLICT':
        context.splog.logDebug(
          branchNames.reduce((cur, next) => `${cur}\n${next}`, 'PERSISTING:')
        );
        persistBranchesToRestack(branchNames, context);
        throw new RebaseConflictError(
          `Hit conflict restacking ${chalk.yellow(branchName)} on ${chalk.cyan(
            context.metaCache.getParentPrecondition(branchName)
          )}.`
        );

      case 'REBASE_UNNEEDED':
        context.splog.logInfo(
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
