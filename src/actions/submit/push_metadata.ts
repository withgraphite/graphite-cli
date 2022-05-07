import chalk from 'chalk';
import { TContext } from '../../lib/context/context';
import { ExitFailedError } from '../../lib/errors';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { logError, logInfo, logNewline } from '../../lib/utils/splog';
import { MetadataRef } from '../../wrapper-classes';
import { Branch } from '../../wrapper-classes/branch';

export async function pushMetadata(
  branchesPushedToRemote: Branch[],
  context: TContext
): Promise<void> {
  if (!context.userConfig.data.experimental) {
    return;
  }

  logInfo(chalk.blueBright(`➡️ [Step 5] Updating remote stack metadata...`));

  if (!branchesPushedToRemote.length) {
    logInfo(`No branches were pushed to remote.`);
    logNewline();
    return;
  }

  const remote = context.repoConfig.getRemote();

  branchesPushedToRemote.forEach((branch) => {
    logInfo(
      `Setting source of truth stack metadata for ${chalk.green(
        branch.name
      )}...`
    );
    gpExecSync(
      {
        command: `git push origin "+refs/branch-metadata/${branch.name}:refs/branch-metadata/${branch.name}"`,
        options: {
          printStdout: true,
        },
      },
      (err) => {
        logError(`Failed to push stack metadata for ${branch.name} to remote.`);
        throw new ExitFailedError(err.stderr.toString());
      }
    );
    MetadataRef.copyMetadataRefToRemoteTracking(remote, branch.name);
  });
}
