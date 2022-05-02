import chalk from 'chalk';
import prompts from 'prompts';
import { execStateConfig } from '../../lib/config/exec_state_config';
import { TContext } from '../../lib/context/context';
import { ExitFailedError, KilledError } from '../../lib/errors';
import { getTrunk, logInfo } from '../../lib/utils';
import { Branch } from '../../wrapper-classes/branch';

export async function mergeDownstack(
  branchName: string,
  context: TContext
): Promise<'ABORT' | 'CONTINUE'> {
  const remote = context.repoConfig.getRemote();
  logInfo(`Syncing branch ${chalk.yellow(branchName)} from remote ${remote}:`);

  const remoteParent = getRemoteParentOrThrow(branchName, remote);

  if (remoteParent !== getTrunk(context).name) {
    logInfo(
      `${chalk.yellow(branchName)} depends on ${chalk.yellow(remoteParent)}...`
    );
    if ((await mergeDownstack(remoteParent, context)) === 'ABORT') {
      return 'ABORT';
    }
  }

  if (!Branch.exists(branchName)) {
    logInfo(
      `${chalk.yellow(branchName)} does not exist locally; no merge needed.`
    );
    Branch.copyFromRemote(branchName, remote);
    logInfo(`${chalk.green(branchName)} set to match remote.`);
    return 'CONTINUE';
  }

  return handleExistingBranch(branchName, remote);
}

function getRemoteParentOrThrow(branchName: string, remote: string): string {
  if (!Branch.existsOnRemote(branchName, remote)) {
    throw new ExitFailedError(
      [
        `Branch ${chalk.red(branchName)} does not exist on remote ${remote}`,
        `Only submitted branches can be synced from remote.`,
      ].join('\n')
    );
  }
  if (!Branch.metaExistsOnRemote(branchName, remote)) {
    throw new ExitFailedError(
      [
        `Metadata for ${chalk.red(
          branchName
        )} does not exist on remote ${remote}.`,
        `Only branches submitted with Graphite can be synced from remote.`,
      ].join('\n')
    );
  }

  const remoteParent = Branch.getParentFromRemote(branchName, remote);

  if (!remoteParent) {
    throw new ExitFailedError(
      [
        `Could not find a parent for ${branchName} on remote ${remote}.`,
        `Only branches submitted with Graphite can be synced from remote.`,
      ].join('\n')
    );
  }
  return remoteParent;
}

async function handleExistingBranch(
  branchName: string,
  remote: string
): Promise<'ABORT' | 'CONTINUE'> {
  logInfo(
    `${chalk.yellow(
      branchName
    )} exists locally. Merging local state is not yet implemented.`
  );

  if (
    !execStateConfig.interactive() ||
    !(await prompts(
      {
        type: 'confirm',
        name: 'value',
        message: `Discard local changes to ${chalk.yellow(
          branchName
        )} and sync from ${remote}?`,
        initial: false,
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    ))
  ) {
    return 'ABORT';
  }

  Branch.copyFromRemote(branchName, remote);
  logInfo(`${chalk.green(branchName)} set to match remote.`);
  return 'CONTINUE';
}
