import { ExitFailedError } from '../lib/errors';
import { gpExecSync } from '../lib/utils';
import { MetadataRef } from '../wrapper-classes';

export function deleteBranchAction(args: {
  branchName: string;
  force: boolean;
}): void {
  const meta = new MetadataRef(args.branchName);

  // No need for a try-catch here; this already silently does nothing if the
  // metadata does not exist.
  meta.delete();

  gpExecSync(
    {
      command: `git branch ${args.force ? '-D' : '-d'} ${args.branchName}`,
      options: { stdio: 'pipe' },
    },
    (err) => {
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
}
