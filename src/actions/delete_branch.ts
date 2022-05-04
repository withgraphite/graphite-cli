import { TContext } from '../lib/context/context';
import { ExitFailedError } from '../lib/errors';
import { checkoutBranch, getTrunk, gpExecSync } from '../lib/utils';
import { MetadataRef } from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';

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

  const currentBranch = Branch.getCurrentBranch();
  if (currentBranch?.name === args.branchName) {
    checkoutBranch(currentBranch.getParentFromMeta(context)?.name ?? trunk, {
      quiet: true,
    });
  }

  gpExecSync(
    {
      command: `git branch ${args.force ? '-D' : '-d'} ${args.branchName}`,
      options: { stdio: 'pipe' },
    },
    (err) => {
      if (currentBranch?.name === args.branchName) {
        checkoutBranch(currentBranch.name, {
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
