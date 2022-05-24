import { TContext } from '../lib/context';
import { PreconditionsFailedError } from '../lib/errors';
import { currentBranchPrecondition } from '../lib/preconditions';
import { gpExecSync } from '../lib/utils/exec_sync';

export async function showBranchAction(
  context: TContext,
  opts: { patch: boolean }
): Promise<void> {
  const currentBranch = currentBranchPrecondition();

  const baseRev = currentBranch.getParentBranchSha();
  if (!baseRev) {
    throw new PreconditionsFailedError(
      `Graphite does not have a base revision for this branch; it might have been created with an older version of Graphite.  Please run a 'fix' or 'validate' command in order to backfill this information.`
    );
  }

  gpExecSync({
    command: `git log ${opts.patch ? '-p' : ''} ${baseRev}.. --`,
    options: { stdio: 'inherit' },
  });
}
