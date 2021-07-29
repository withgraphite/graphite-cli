import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import Branch from "../../wrapper-classes/branch";

function findRemoteOriginBranch(): Branch | undefined {
  let config;
  try {
    const gitDir = execSync(`git rev-parse --git-dir`).toString().trim();
    config = fs.readFileSync(path.join(gitDir, "config")).toString();
  } catch {
    throw new Error(`Failed to read .git config when determining trunk branch`);
  }
  const originBranchSections = config
    .split("[")
    .filter(
      (section) =>
        section.includes('branch "') && section.includes("remote = origin")
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

function findCommonlyNamedTrunk(): Branch {
  const potentialTrunks = Branch.allBranches().filter((b) =>
    ["main", "master"].includes(b.name)
  );
  if (potentialTrunks.length === 1) {
    return potentialTrunks[0];
  } else if (potentialTrunks.length === 0) {
    throw new Error(
      `Failed to find either "main" or "master" branch, cannot infer repo trunk.`
    );
  } else {
    throw new Error(
      `Detected both a "main" and "master" branch, cannot infer repo trunk.`
    );
  }
}

let memoizedTrunk: Branch;
export function getTrunk(): Branch {
  if (memoizedTrunk) {
    return memoizedTrunk;
  }
  const remoteOriginBranch = findRemoteOriginBranch();
  if (remoteOriginBranch) {
    memoizedTrunk = remoteOriginBranch;
    return memoizedTrunk;
  }
  memoizedTrunk = findCommonlyNamedTrunk();
  return memoizedTrunk;
}
