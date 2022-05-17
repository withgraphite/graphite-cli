import chalk from 'chalk';
import { TContext } from '../lib/context';
import { ExitFailedError } from '../lib/errors';
import { checkoutBranch } from '../lib/git/checkout_branch';
import { getCurrentBranchName } from '../lib/git/current_branch_name';
import { deleteBranch } from '../lib/git/deleteBranch';
import { getTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';
import { MetadataRef } from '../wrapper-classes/metadata_ref';
import { mergedBaseIfMerged } from './clean_branches';

export function deleteBranchAction(
  args: {
    branchName: string;
    force: boolean;
  },
  context: TContext
): void {
  const trunk = getTrunk(context).name;
  if (trunk === args.branchName) {
    throw new ExitFailedError('Cannot delete trunk!');
  }

  const current = getCurrentBranchName();

  if (
    !args.force &&
    !mergedBaseIfMerged(Branch.branchWithName(args.branchName), context)
  ) {
    throw new ExitFailedError(
      `The branch ${args.branchName} is not fully merged.  Use the \`--force\` option to delete it.`
    );
  }

  if (current === args.branchName) {
    checkoutBranch(
      Branch.branchWithName(current).getParentFromMeta(context)?.name ?? trunk,
      {
        quiet: true,
      }
    );
  }

  deleteBranch(args.branchName);
  context.splog.logInfo(`Deleted branch ${chalk.red(args.branchName)}`);

  // No need for a try-catch here; this already silently does nothing if the
  // metadata does not exist.
  new MetadataRef(args.branchName).delete();
}
