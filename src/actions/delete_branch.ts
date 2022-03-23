import { TContext } from 'src/lib/context/context';
import { ExitFailedError } from '../lib/errors';
import { gpExecSync, logTip } from '../lib/utils';
import { MetadataRef } from '../wrapper-classes';

export function deleteBranchAction(
  args: {
    branchName: string;
    force: boolean;
  },
  context?: TContext
): void {
  const meta = new MetadataRef(args.branchName);

  // No need for a try-catch here; this already silently does nothing if the
  // metadata does not exist.
  meta.delete();

  if (context && !args.force) {
    logTip(`You can force branch deletion with -D`, context);
  }

  gpExecSync(
    {
      command: `git branch ${args.force ? '-D' : '-d'} ${args.branchName}`,
    },
    (err) => {
      throw new ExitFailedError('Failed to delete branch. Aborting...', err);
    }
  );
}
