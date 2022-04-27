import chalk from 'chalk';
import { TContext } from '../../lib/context/context';
import { ExitFailedError } from '../../lib/errors';
import { getTrunk, logInfo } from '../../lib/utils';
import { Branch } from '../../wrapper-classes/branch';

export function mergeDownstack(branchName: string, context: TContext): void {
  const remote = context.repoConfig.getRemote();
  logInfo(`Syncing branch ${chalk.yellow(branchName)} from remote ${remote}:`);

  const remoteParent = getRemoteParentOrThrow(branchName, remote);

  if (remoteParent !== getTrunk(context).name) {
    logInfo(
      `${chalk.yellow(branchName)} depends on ${chalk.yellow(remoteParent)}...`
    );
    mergeDownstack(remoteParent, context);
  }

  if (Branch.exists(branchName)) {
    throw new ExitFailedError(
      'Syncing an existing branch not yet implemented.'
    );
  } else {
    logInfo(
      `${chalk.yellow(branchName)} does not exist locally; no merge needed.`
    );
    Branch.copyFromRemote(branchName, remote);
    logInfo(`${chalk.green(branchName)} set to match remote.`);
  }
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
