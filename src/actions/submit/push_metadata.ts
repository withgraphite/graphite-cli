import chalk from 'chalk';
import { ExitFailedError } from '../../lib/errors';
import { gpExecSync, logError, logInfo } from '../../lib/utils';
import { Branch } from '../../wrapper-classes/branch';

export async function pushMetadata(
  branchesPushedToRemote: Branch[]
): Promise<void> {
  logInfo(chalk.blueBright(`➡️ [Step 5] Pushing stack metadata to GitHub...`));

  if (!branchesPushedToRemote.length) {
    logInfo(`No eligible branches to push stack metadata for.`);
    return;
  }

  branchesPushedToRemote.forEach((branch) => {
    logInfo(`Pushing stack metadata for ${branch.name} to remote...`);
    gpExecSync(
      {
        command: `git push origin "+refs/branch-metadata/${branch.name}:refs/branch-metadata/${branch.name}"`,
      },
      (err) => {
        logError(`Failed to push stack metadata for ${branch.name} to remote.`);
        throw new ExitFailedError(err.stderr.toString());
      }
    );
  });
}
