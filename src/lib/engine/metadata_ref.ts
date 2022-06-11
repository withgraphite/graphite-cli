import { cuteString } from '../utils/cute_string';
import { q } from '../utils/escape_for_shell';
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
    } update-ref refs/branch-metadata/${q(branchName)} ${metaSha}`,
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
        }cat-file -p refs/branch-metadata/${q(branchName)} 2> /dev/null`,
      })
    );
  } catch {
    return {};
  }
}

export function deleteMetadataRef(branchName: string): void {
  gpExecSync({
    command: `git update-ref -d refs/branch-metadata/${q(branchName)}`,
  });
}

export function getMetadataRefList(): Record<string, string> {
  const meta: Record<string, string> = {};

  gpExecSyncAndSplitLines({
    command: `git for-each-ref --format='%(refname:lstrip=2):%(objectname)' refs/branch-metadata/`,
  })
    .map((line) => line.split(':'))
    .filter(
      (lineSplit): lineSplit is [string, string] =>
        lineSplit.length === 2 && lineSplit.every((s) => s.length > 0)
    )
    .forEach(([branchName, metaSha]) => (meta[branchName] = metaSha));

  return meta;
}
