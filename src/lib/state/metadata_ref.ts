import { cuteString } from '../utils/cute_string';
import { gpExecSync, gpExecSyncAndSplitLines } from '../utils/exec_sync';

type TBranchPRState = 'OPEN' | 'CLOSED' | 'MERGED';
type TBranchPRReviewDecision =
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
    command: `git ${
      opts ? `-C "${opts.dir}"` : ''
    } update-ref refs/branch-metadata/${branchName} ${metaSha}`,
    options: {
      stdio: 'ignore',
    },
  });
}

export function readMetadataRef(
  branchName: string,
  opts?: { dir: string }
): TMeta {
  // TODO: Better account for malformed desc; possibly validate with retype
  try {
    return JSON.parse(
      gpExecSync({
        command: `git ${
          opts ? `-C "${opts.dir}" ` : ''
        }cat-file -p refs/branch-metadata/${branchName} 2> /dev/null`,
      })
    );
  } catch {
    return {};
  }
}

export function deleteMetadataRef(branchName: string): void {
  gpExecSync({
    command: `git update-ref -d refs/branch-metadata/${branchName}`,
  });
}

export function allBranchesWithMeta(): string[] {
  return gpExecSyncAndSplitLines({
    command: `git for-each-ref --format='%(refname:lstrip=2)' refs/branch-metadata/`,
  });
}
