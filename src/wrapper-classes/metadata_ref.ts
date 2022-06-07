import fs from 'fs-extra';
import path from 'path';
import { ExitFailedError } from '../lib/errors';
import { getRepoRootPathPrecondition } from '../lib/preconditions';
import { cuteString } from '../lib/utils/cute_string';
import { gpExecSync } from '../lib/utils/exec_sync';

export type TBranchPRState = 'OPEN' | 'CLOSED' | 'MERGED';
export type TBranchPRReviewDecision =
  | 'APPROVED'
  | 'REVIEW_REQUIRED'
  | 'CHANGES_REQUESTED';
export type TBranchPRInfo = {
  number?: number;
  base?: string;
  url?: string;
  title?: string;
  body?: string;
  state?: TBranchPRState;
  reviewDecision?: TBranchPRReviewDecision;
  isDraft?: boolean;
};

export type TMeta = {
  parentBranchName?: string;
  parentBranchRevision?: string;
  prevRef?: string;
  prInfo?: TBranchPRInfo;
};

export function writeMetadataRef(
  branchName: string,
  meta: TMeta,
  opts?: { dir: string }
): void {
  const metaSha = gpExecSync({
    command: `git ${opts ? `-C "${opts.dir}"` : ''} hash-object -w --stdin`,
    options: {
      input: cuteString(meta),
    },
  });
  gpExecSync({
    command: `git update-ref refs/branch-metadata/${branchName} ${metaSha}`,
    options: {
      stdio: 'ignore',
    },
  });
}

export function readMetadataRef(
  branchName: string,
  opts?: { dir: string }
): TMeta | undefined {
  const metaString = gpExecSync({
    command: `git ${
      opts ? `-C "${opts.dir}" ` : ''
    }cat-file -p refs/branch-metadata/${branchName} 2> /dev/null`,
  });
  if (metaString.length == 0) {
    return undefined;
  }
  // TODO: Better account for malformed desc; possibly validate with retype
  const meta = JSON.parse(metaString);
  return meta;
}

export function moveMetadataRef(
  oldBranchName: string,
  newBranchName: string
): void {
  const oldPath = getMetadataPath(oldBranchName);
  if (!fs.existsSync(oldPath)) {
    throw new ExitFailedError(`No Graphite metadata ref found at ${oldPath}`);
  }
  fs.moveSync(
    path.join(oldPath),
    path.join(path.dirname(oldPath), newBranchName)
  );
}

export function deleteMetadataRef(branchName: string): void {
  fs.removeSync(getMetadataPath(branchName));
}

function getMetadataPath(branchName: string): string {
  return path.join(branchMetadataDirPath(), branchName);
}

function branchMetadataDirPath(): string {
  return path.join(getRepoRootPathPrecondition(), `refs/branch-metadata/`);
}

export function allBranchesWithMeta(): string[] {
  if (!fs.existsSync(branchMetadataDirPath())) {
    return [];
  }
  return fs.readdirSync(branchMetadataDirPath());
}
