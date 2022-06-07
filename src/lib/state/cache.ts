import {
  MetadataRef,
  TBranchPRInfo,
  TMeta,
} from '../../wrapper-classes/metadata_ref';
import { PreconditionsFailedError } from '../errors';
import { checkoutBranch } from '../git/checkout_branch';
import { getCurrentBranchName } from '../git/current_branch_name';
import { getBranchRevision } from '../git/get_branch_revision';
import { getMergeBase } from '../git/merge_base';
import { branchNamesAndRevisions } from '../git/sorted_branch_names';
import { TSplog } from '../utils/splog';

export type TMetaCache = {
  size: number;
  currentBranch: string | undefined;
  currentBranchPrecondition: string;
  trunk: string;
  isTrunk: (branchName: string) => boolean;
  getChildren: (branchName: string) => string[];
  getParent: (branchName: string) => string | undefined;
  checkoutBranch: (branchName: string) => boolean;
};

type TCachedMeta = { children: string[]; branchRevision: string } & (
  | {
      validationResult: 'TRUNK';
      parentBranchName: undefined;
      fixed: true;
    }
  | {
      validationResult: 'VALID';
      parentBranchName: string;
      parentBranchRevision: string;
      fixed: boolean;
      prInfo?: TBranchPRInfo;
    }
  | {
      validationResult: 'INVALID_PARENT';
      parentBranchName: string;
      parentBranchRevision?: string;
    }
  | {
      validationResult: 'BAD_PARENT_REVISION';
      parentBranchName: string;
    }
  | {
      validationResult: 'BAD_PARENT_NAME';
    }
);

type TValidCachedMeta = TCachedMeta & { validationResult: 'TRUNK' | 'VALID' };

export function composeMetaCache(
  trunkName: string | undefined,
  splog: TSplog
): TMetaCache {
  const cache = {
    currentBranch: getCurrentBranchName(),
    branches: loadCache(trunkName, splog),
  };

  const getValidMeta = (branchName: string): TValidCachedMeta | undefined => {
    const cachedMeta = cache.branches[branchName];
    return cachedMeta?.validationResult === 'TRUNK' ||
      cachedMeta?.validationResult === 'VALID'
      ? cachedMeta
      : undefined;
  };

  return {
    get size() {
      return Object.keys(cache).length;
    },
    get currentBranch() {
      return cache.currentBranch;
    },
    get currentBranchPrecondition() {
      if (!cache.currentBranch || !getValidMeta(cache.currentBranch)) {
        throw new PreconditionsFailedError(
          `Please check out a valid Graphite branch.`
        );
      }
      return cache.currentBranch;
    },
    get trunk() {
      if (!trunkName) {
        throw new PreconditionsFailedError(`No trunk found.`);
      }
      return trunkName;
    },
    isTrunk: (branchName: string) =>
      cache.branches[branchName]?.validationResult === 'TRUNK',
    getChildren: (branchName: string) => cache.branches[branchName].children,
    getParent: (branchName: string) => {
      const meta = cache.branches[branchName];
      return meta.validationResult === 'BAD_PARENT_NAME'
        ? undefined
        : meta.parentBranchName;
    },
    checkoutBranch: (branchName: string): boolean => {
      if (!getValidMeta(branchName)) {
        return false;
      }
      checkoutBranch(branchName);
      cache.currentBranch = branchName;
      return true;
    },
  };
}

export function loadCache(
  trunkName: string | undefined,
  splog: TSplog
): Record<string, TCachedMeta> {
  const branches: Record<string, TCachedMeta> = {};
  if (!trunkName) {
    return branches;
  }

  branches[trunkName] = {
    validationResult: 'TRUNK',
    parentBranchName: undefined,
    branchRevision: getBranchRevision(trunkName),
    fixed: true,
    children: [],
  };

  splog.logDebug('Reading metadata...');
  const metaToValidate = readAllMeta();

  const allBranchNames = new Set([
    trunkName,
    ...metaToValidate.map((meta) => meta.branchName),
  ]);

  while (metaToValidate.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const current = metaToValidate.shift()!;
    const {
      branchName,
      branchRevision,
      parentBranchName,
      parentBranchRevision,
    } = current;

    // Check parentBranchName
    if (
      !parentBranchName ||
      parentBranchName === branchName ||
      !allBranchNames.has(parentBranchName)
    ) {
      splog.logDebug(`bad parent name: ${branchName}`);
      branches[branchName] = {
        validationResult: 'BAD_PARENT_NAME',
        branchRevision,
        children: [],
      };
      continue;
    }

    // If parent hasn't been checked yet, we'll come back to this branch
    const parentCachedMeta = branches[parentBranchName];
    if (typeof parentCachedMeta === 'undefined') {
      metaToValidate.push(current);
      continue;
    }

    parentCachedMeta.children.push(branchName);

    // Check if the parent is valid (or trunk)
    if (
      parentCachedMeta.validationResult !== 'VALID' &&
      parentCachedMeta.validationResult !== 'TRUNK'
    ) {
      splog.logDebug(`invalid parent: ${branchName}`);
      branches[branchName] = {
        validationResult: 'INVALID_PARENT',
        parentBranchName,
        parentBranchRevision,
        branchRevision,
        children: [],
      };
      continue;
    }

    // Check parentBranchRevision
    if (
      !parentBranchRevision ||
      getMergeBase(branchName, parentBranchRevision) !== parentBranchRevision
    ) {
      splog.logDebug(`bad parent rev: ${branchName}`);
      branches[branchName] = {
        validationResult: 'BAD_PARENT_REVISION',
        parentBranchName,
        branchRevision,
        children: [],
      };
      continue;
    }

    // This branch and its recursive parents are valid
    splog.logDebug(`validated: ${branchName}`);
    branches[branchName] = {
      validationResult: 'VALID',
      parentBranchName,
      parentBranchRevision,
      branchRevision,
      fixed: parentBranchRevision === parentCachedMeta.branchRevision,
      children: [],
    };
  }

  return branches;
}

function readAllMeta(): Array<
  { branchName: string; branchRevision: string } & TMeta
> {
  const gitBranchNamesAndRevisions = branchNamesAndRevisions();
  return MetadataRef.allMetadataRefs()
    .filter((ref) => {
      // As we read the refs, cleanup any whose branch is missing
      if (!gitBranchNamesAndRevisions.has(ref._branchName)) {
        ref.delete();
        return false;
      }
      return true;
    })
    .map((ref) => ({
      branchName: ref._branchName,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      branchRevision: gitBranchNamesAndRevisions.get(ref._branchName)!,
      ...ref.read(),
    }));
}
