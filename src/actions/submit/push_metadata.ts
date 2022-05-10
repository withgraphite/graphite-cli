import { TContext } from '../../lib/context';
import { ExitFailedError } from '../../lib/errors';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { logError } from '../../lib/utils/splog';
import { Branch } from '../../wrapper-classes/branch';
import { MetadataRef } from '../../wrapper-classes/metadata_ref';

export function pushMetadataRef(branch: Branch, context: TContext): void {
  if (!context.userConfig.data.experimental) {
    return;
  }
  gpExecSync(
    {
      command: `git push origin "+refs/branch-metadata/${branch.name}:refs/branch-metadata/${branch.name}" 2>&1`,
    },
    (err) => {
      logError(`Failed to push stack metadata for ${branch.name} to remote.`);
      throw new ExitFailedError(err.stderr.toString());
    }
  );
  MetadataRef.copyMetadataRefToRemoteTracking(
    context.repoConfig.getRemote(),
    branch.name
  );
}
