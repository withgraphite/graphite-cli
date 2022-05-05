import chalk from 'chalk';
import { execStateConfig } from '../../lib/config/exec_state_config';
import { TContext } from '../../lib/context/context';
import { ExitFailedError } from '../../lib/errors';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { logError, logInfo, logNewline, logTip } from '../../lib/utils/splog';
import { Branch } from '../../wrapper-classes/branch';

export function pushBranchesToRemote(
  branches: Branch[],
  context: TContext
): Branch[] {
  logInfo(chalk.blueBright('➡️  [Step 3] Pushing branches to remote...'));

  if (!branches.length) {
    logInfo(`No eligible branches to push.`);
    logNewline();
    return [];
  }

  return branches
    .map((branch) => {
      logInfo(
        `Pushing ${chalk.cyan(
          branch.name
        )} with --force-with-lease (will not override external commits to remote)...`
      );

      return gpExecSync(
        {
          // redirecting stderr to stdout here because 1) git prints the output
          // of the push command to stderr 2) we want to analyze it but Node's
          // execSync makes analyzing stderr extremely challenging
          command: [
            `git push ${context.repoConfig.getRemote()}`,
            `--force-with-lease ${branch.name} 2>&1`,
            ...[execStateConfig.noVerify() ? ['--no-verify'] : []],
          ].join(' '),
          options: {
            printStdout: (output) =>
              output
                .split('\n')
                .filter((line) => !line.startsWith('remote:'))
                .join('\n'),
          },
        },
        (err) => {
          logError(`Failed to push changes for ${branch.name} to remote.`);

          logTip(
            `There may be external commits on remote that were not overwritten with the attempted push.
          \n Use 'git pull' to pull external changes and retry.`,
            context
          );
          throw new ExitFailedError(err.stderr.toString());
        }
      )
        .toString()
        .trim()
        .includes('Everything up-to-date')
        ? undefined
        : branch;
    })
    .filter((b): b is Branch => b !== undefined);
}
