import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { Branch } from '../../wrapper-classes/branch';
import { ConfigError, ExitFailedError } from '../errors';
import { TContext } from './../context/context';

function findRemoteOriginBranch(context: TContext): Branch | undefined {
  let config;
  try {
    const gitDir = execSync(`git rev-parse --git-dir`).toString().trim();
    config = fs.readFileSync(path.join(gitDir, 'config')).toString();
  } catch {
    throw new Error(`Failed to read .git config when determining trunk branch`);
  }
  const originBranchSections = config
    .split('[')
    .filter(
      (section) =>
        section.includes('branch "') &&
        section.includes(`remote = ${context.repoConfig.getRemote()}`)
    );
  if (originBranchSections.length !== 1) {
    return undefined;
  }
  try {
    const matches = originBranchSections[0].match(/branch "(.+)"\]/);
    if (matches && matches.length == 1) {
      return new Branch(matches[0]);
    }
  } catch {
    return undefined;
  }
  return undefined;
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
  return findRemoteOriginBranch(context) || findCommonlyNamedTrunk(context);
}
export function getTrunk(context: TContext): Branch {
  const configTrunkName = context.repoConfig.data.trunk;
  if (!configTrunkName) {
    throw new ConfigError(
      `No configured trunk branch. Consider setting the trunk name by running "gt repo init".`
    );
  }

  if (!Branch.exists(configTrunkName)) {
    throw new ExitFailedError(
      `Configured trunk branch (${configTrunkName}) not found in the current repo. Consider updating the trunk name by running "gt repo init".`
    );
  }
  return new Branch(configTrunkName);
}
