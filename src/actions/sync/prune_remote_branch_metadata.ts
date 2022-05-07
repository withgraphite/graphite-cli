import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from 'src/lib/context/context';
import { execStateConfig } from '../../lib/config/exec_state_config';
import { KilledError } from '../../lib/errors';
import { gpExecSync } from '../../lib/utils/exec_sync';
import { logInfo, logNewline } from '../../lib/utils/splog';

export async function pruneRemoteBranchMetadata(
  context: TContext,
  force: boolean
): Promise<void> {
  if (!context.userConfig.data.experimental) {
    return;
  }

  const remote = context.repoConfig.getRemote();
  const branchesNeedingPruning = gpExecSync({
    command: `git for-each-ref --format="%(refname)" "refs/${remote}-branch-metadata/"`,
  })
    .toString()
    .trim()
    .split('\n')
    .map((remoteBranchMetadataPath) =>
      remoteBranchMetadataPath.replace(
        `refs/${remote}-branch-metadata/`,
        `refs/remotes/${remote}/`
      )
    )
    .filter(
      (remoteBranchPath) =>
        gpExecSync({
          command: `git show-ref ${remoteBranchPath}`,
          options: {},
        }).length === 0
    )
    .map((remoteBranchPath) =>
      remoteBranchPath.replace(`refs/remotes/${remote}/`, '')
    );

  if (branchesNeedingPruning.length === 0) {
    return;
  }
  const hasMultipleBranches = branchesNeedingPruning.length > 1;

  logInfo(
    `Remote ${remote} has Graphite metadata for the following branch${
      hasMultipleBranches ? 'es that no longer exist' : ' that no longer exists'
    }:`
  );
  branchesNeedingPruning.forEach((branchName) =>
    logInfo(`▸ ${chalk.yellow(branchName)}`)
  );

  if (
    !force &&
    (!execStateConfig.interactive() ||
      !(
        await prompts(
          {
            type: 'confirm',
            name: 'value',
            message: `Would you like to delete the unused refs from ${remote}?`,
            initial: true,
          },
          {
            onCancel: () => {
              throw new KilledError();
            },
          }
        )
      ).value)
  ) {
    return;
  }

  logInfo(`Pruning remote metadata...`);
  branchesNeedingPruning.forEach((branchName) => {
    gpExecSync({
      command: `git push ${remote} -d refs/branch-metadata/${branchName}`,
    });
    gpExecSync({
      command: `git update-ref -d refs/${remote}-branch-metadata/${branchName}`,
    });
  });
  logNewline();
}
