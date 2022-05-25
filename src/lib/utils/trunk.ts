import { Branch } from '../../wrapper-classes/branch';
import { TContext } from '../context';
import { ConfigError, ExitFailedError } from '../errors';
import { branchExists } from '../git/branch_exists';
import { gpExecSync } from './exec_sync';

function findRemoteBranch(context: TContext): Branch | undefined {
  // e.g. for most repos: branch.main.remote origin
  // TODO will move this call to the /git/ lib later on in the engine refactor
  const branchName = gpExecSync({
    command: `git config --get-regexp remote$ "^${context.repoConfig.getRemote()}$"`,
  })
    // so, we take the first line of the output
    .split('\n')[0]
    // and retrieve branchName from `branch.<branchName>.remote`
    ?.split('.')[1];

  if (!branchName) {
    return undefined;
  }
  return new Branch(branchName);
}

function findCommonlyNamedTrunk(context: TContext): Branch | undefined {
  const potentialTrunks = Branch.allBranches(context).filter((b) =>
    ['main', 'master', 'development', 'develop'].includes(b.name)
  );
  if (potentialTrunks.length === 1) {
    return potentialTrunks[0];
  }
  return undefined;
}

export function inferTrunk(context: TContext): Branch | undefined {
  return findRemoteBranch(context) || findCommonlyNamedTrunk(context);
}
export function getTrunk(context: TContext): Branch {
  const configTrunkName = context.repoConfig.data.trunk;
  if (!configTrunkName) {
    throw new ConfigError(
      `No configured trunk branch. Consider setting the trunk name by running "gt repo init".`
    );
  }

  if (!branchExists(configTrunkName)) {
    throw new ExitFailedError(
      `Configured trunk branch (${configTrunkName}) not found in the current repo. Consider updating the trunk name by running "gt repo init".`
    );
  }
  return new Branch(configTrunkName);
}
