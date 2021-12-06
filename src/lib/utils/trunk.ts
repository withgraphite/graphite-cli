import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import Branch from '../../wrapper-classes/branch';
import { repoConfig } from '../config';
import { ConfigError, ExitFailedError, SiblingBranchError } from '../errors';

function findRemoteOriginBranch(): Branch | undefined {
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
        section.includes('branch "') && section.includes('remote = origin')
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

function findCommonlyNamedTrunk(): Branch | undefined {
  const potentialTrunks = Branch.allBranches().filter((b) =>
    ['main', 'master', 'development', 'develop'].includes(b.name)
  );
  if (potentialTrunks.length === 1) {
    return potentialTrunks[0];
  }
  return undefined;
}

let memoizedTrunk: Branch;
export function inferTrunk(): Branch | undefined {
  return findRemoteOriginBranch() || findCommonlyNamedTrunk();
}
export function getTrunk(): Branch {
  if (memoizedTrunk) {
    return memoizedTrunk;
  }
  const configTrunkName = repoConfig.getTrunk();
  if (configTrunkName) {
    if (!Branch.exists(configTrunkName)) {
      throw new ExitFailedError(
        `Configured trunk branch (${configTrunkName}) not found in the current repo. Consider updating the trunk name by running "gt repo init".`
      );
    }
    memoizedTrunk = new Branch(configTrunkName, { useMemoizedResults: true });
  }

  // No configured trunk, infer
  if (!memoizedTrunk) {
    const inferredTrunk = inferTrunk();
    if (inferredTrunk) {
      memoizedTrunk = inferredTrunk.useMemoizedResults();
      return memoizedTrunk;
    }
    throw new ConfigError(
      `No configured trunk branch, and unable to infer. Consider setting the trunk name by running "gt repo init".`
    );
  }
  const trunkSiblings = memoizedTrunk.branchesWithSameCommit();
  if (trunkSiblings.length > 0) {
    throw new SiblingBranchError([memoizedTrunk].concat(trunkSiblings));
  }
  return memoizedTrunk;
}
