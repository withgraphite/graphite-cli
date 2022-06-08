import chalk from 'chalk';
import { TContext } from '../lib/context';
import { SCOPE } from '../lib/engine/scope_spec';
import { ExitFailedError } from '../lib/errors';
import { restackBranches } from './restack';

export function deleteBranchAction(
  args: {
    branchName: string;
    force?: boolean;
  },
  context: TContext
): void {
  if (context.metaCache.isTrunk(args.branchName)) {
    throw new ExitFailedError('Cannot delete trunk!');
  }

  if (!args.force && !isSafeToDelete(args.branchName, context).result) {
    context.splog.logTip(
      `By default, this command only allows deletion of merged or closed branches.`
    );

    throw new ExitFailedError(
      [
        `The branch ${args.branchName} is not safe to delete.  Use the \`--force\` option to delete it.`,
        `Note that its changes will be lost, as its children will be restacked onto its parent.`,
      ].join('\n')
    );
  }

  const branchesToRestack = context.metaCache.getRelativeStack(
    args.branchName,
    SCOPE.UPSTACK_EXCLUSIVE
  );
  context.metaCache.deleteBranch(args.branchName);
  context.splog.logInfo(`Deleted branch ${chalk.red(args.branchName)}`);

  restackBranches(branchesToRestack, context);
}

// Where did we merge this? If it was merged on GitHub, we see where it was
// merged into. If we don't detect that it was merged in GitHub but we do
// see the code in trunk, we fallback to say that it was merged into trunk.
// This extra check (rather than just saying trunk) is used to catch the
// case where one feature branch is merged into another on GitHub.
export function isSafeToDelete(
  branchName: string,
  context: TContext
): { result: true; reason: string } | { result: false } {
  const prInfo = context.metaCache.getPrInfo(branchName);

  const reason =
    prInfo?.state === 'CLOSED'
      ? `${chalk.red(branchName)} is closed on GitHub`
      : prInfo?.state === 'MERGED'
      ? `${chalk.green(branchName)} is merged into ${chalk.cyan(
          prInfo?.base ?? context.metaCache.trunk
        )}`
      : context.metaCache.isMergedIntoTrunk(branchName)
      ? `${chalk.green(branchName)} is merged into ${chalk.cyan(
          context.metaCache.trunk
        )}`
      : undefined;

  return reason ? { result: true, reason } : { result: false };
}
