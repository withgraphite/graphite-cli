import chalk from 'chalk';
import { ExitFailedError } from '../../lib/errors';
import { gpExecSync, logError, logInfo, logNewline } from '../../lib/utils';
import { Branch } from '../../wrapper-classes/branch';

export async function pushMetadata(
  branchesPushedToRemote: Branch[]
): Promise<void> {
  logInfo(chalk.blueBright(`➡️ [Step 5] Updating remote stack metadata...`));

  if (!branchesPushedToRemote.length) {
    logInfo(`No branches were pushed to remote.`);
    logNewline();
    return;
  }

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
  });
}
