import chalk from 'chalk';
import { persistBranchesToRestack } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
import { RebaseConflictError } from '../lib/errors';
import { TScopeSpec } from '../lib/state/scope_spec';
import { assertUnreachable } from '../lib/utils/assert_unreachable';

type TBranchList =
  | {
      relative: false;
      branchNames: string[];
    }
  | {
      relative: true;
      scope: TScopeSpec;
    };

export function restackBranches(
  branchList: TBranchList,
  context: TContext
): void {
  const branchNames = branchList.relative
    ? context.metaCache.getCurrentStack(branchList.scope)
    : branchList.branchNames;

  context.splog.logDebug(
    branchNames.reduce((acc, curr) => `${acc}\n${curr}`, 'RESTACKING:')
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
