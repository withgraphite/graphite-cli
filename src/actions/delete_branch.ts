import chalk from 'chalk';
import { TContext } from '../lib/context';
import { ExitFailedError } from '../lib/errors';
import { switchBranch } from '../lib/git/checkout_branch';
import { getCurrentBranchName } from '../lib/git/current_branch_name';
import { deleteBranch } from '../lib/git/deleteBranch';
import { getTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';
import { MetadataRef } from '../wrapper-classes/metadata_ref';

export function deleteBranchAction(
  args: {
    branchName: string;
    force?: boolean;
  },
  context: TContext
): void {
  const trunk = getTrunk(context).name;
  if (trunk === args.branchName) {
    throw new ExitFailedError('Cannot delete trunk!');
  }

  const current = getCurrentBranchName();

  if (!args.force && !isSafeToDelete(args.branchName, context)) {
    throw new ExitFailedError(
      `The branch ${args.branchName} is not fully merged.  Use the \`--force\` option to delete it.`
    );
  }

  if (current === args.branchName) {
    switchBranch(
      Branch.branchWithName(current).getParentFromMeta(context)?.name ?? trunk
    );
  }

  deleteBranch(args.branchName);
  context.splog.logInfo(`Deleted branch ${chalk.red(args.branchName)}`);

  // No need for a try-catch here; this already silently does nothing if the
  // metadata does not exist.
  new MetadataRef(args.branchName).delete();
}

export function isSafeToDelete(
  branchName: string,
  context: TContext
): string | false {
  const prInfo = context.metaCache.getPrInfo(branchName);
  const prState = prInfo?.state;
  const prBase = prInfo?.base;

  // Where did we merge this? If it was merged on GitHub, we see where it was
  // merged into. If we don't detect that it was merged in GitHub but we do
  // see the code in trunk, we fallback to say that it was merged into trunk.
  // This extra check (rather than just saying trunk) is used to catch the
  // case where one feature branch is merged into another on GitHub.
  return prState === 'CLOSED'
    ? `${chalk.red(branchName)} is closed on GitHub`
    : prState === 'MERGED'
    ? `${chalk.green(branchName)} is merged into ${chalk.cyan(
        prBase ?? context.metaCache.trunk
      )}`
    : context.metaCache.isMerged(branchName)
    ? `${chalk.green(branchName)} is merged into ${chalk.cyan(
        context.metaCache.trunk
      )}`
    : false;
}
