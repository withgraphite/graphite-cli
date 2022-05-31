import chalk from 'chalk';
import { TContext } from '../lib/context';
import { TScopeSpec } from '../lib/engine/scope_spec';
import { PreconditionsFailedError, RebaseConflictError } from '../lib/errors';
import { addAll } from '../lib/git/add_all';
import { rebaseInProgress } from '../lib/git/rebase_in_progress';
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
    ? context.metaCache.getRelativeStack(
        context.metaCache.currentBranchPrecondition,
        branchList.scope
      )
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

export function continueRestack(
  opts: { addAll: boolean },
  context: TContext
): void {
  if (!rebaseInProgress()) {
    clearContinueConfig(context);
    throw new PreconditionsFailedError(`No Graphite command to continue.`);
  }

  if (opts.addAll) {
    addAll();
  }

  const cont = context.metaCache.continueRebase();
  if (cont.result === 'REBASE_CONFLICT') {
    throw new RebaseConflictError(`Rebase conflict is not yet resolved.`);
  }

  context.splog.logInfo(
    `Resolved rebase conflict for ${chalk.green(cont.branchName)}.`
  );

  const branchesToRestack = context.continueConfig.data?.branchesToRestack;

  if (branchesToRestack) {
    restackBranches(
      { relative: false, branchNames: branchesToRestack },
      context
    );
  }
  clearContinueConfig(context);
}

export function persistBranchesToRestack(
  branchNames: string[],
  context: TContext
): void {
  context.splog.logDebug(
    branchNames.reduce((acc, curr) => `${acc}\n${curr}`, 'PERSISTING:')
  );
  context.continueConfig.update((data) => {
    data.branchesToRestack = branchNames;
    data.currentBranchOverride = context.metaCache.currentBranch;
  });
}

function clearContinueConfig(context: TContext): void {
  context.continueConfig.update((data) => {
    data.branchesToRestack = [];
    data.currentBranchOverride = undefined;
  });
}
