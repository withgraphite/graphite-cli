import { TContext } from '../lib/context';
import { ExitFailedError } from '../lib/errors';
import { checkoutBranch } from '../lib/utils/checkout_branch';
import { currentBranchName } from '../lib/utils/current_branch_name';
import { gpExecSync } from '../lib/utils/exec_sync';
import { getTrunk } from '../lib/utils/trunk';
import { Branch } from '../wrapper-classes/branch';
import { MetadataRef } from '../wrapper-classes/metadata_ref';

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

  const current = currentBranchName();
  if (current === args.branchName) {
    checkoutBranch(
      Branch.branchWithName(current).getParentFromMeta(context)?.name ?? trunk,
      {
        quiet: true,
      }
    );
  }

  gpExecSync(
    {
      command: `git branch ${args.force ? '-D' : '-d'} ${args.branchName}`,
      options: { stdio: 'pipe' },
    },
    (err) => {
      if (current === args.branchName) {
        checkoutBranch(current, {
          quiet: true,
        });
      }
      throw new ExitFailedError(
        [
          'Failed to delete branch. Aborting...',
          err.stderr
            .toString()
            .trim()
            .replace('git branch -D', 'gt branch delete -f'),
        ].join('\n')
      );
    }
  );

  // No need for a try-catch here; this already silently does nothing if the
  // metadata does not exist.
  new MetadataRef(args.branchName).delete();
}
