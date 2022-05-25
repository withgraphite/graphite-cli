import {
  MetadataRef,
  TBranchPRInfo,
  TMeta,
} from '../../wrapper-classes/metadata_ref';
import { PreconditionsFailedError } from '../errors';
import { branchExists } from '../git/branch_exists';
import { checkoutBranch } from '../git/checkout_branch';
import { getCurrentBranchName } from '../git/current_branch_name';
import { getBranchRevision } from '../git/get_branch_revision';
import { getMergeBase } from '../git/merge_base';
import { restack, restackContinue } from '../git/rebase';
import { branchNamesAndRevisions } from '../git/sorted_branch_names';
import { cuteString } from '../utils/cute_string';
import { logDebug } from '../utils/splog';

export type TMetaCache = {
  debug: () => void;
  currentBranch: string | undefined;
  currentBranchPrecondition: string;
  trunk: string;
  isTrunk: (branchName: string) => boolean;
  getChildren: (branchName: string) => string[];
  getParent: (branchName: string) => string | undefined;
  getParentPrecondition: (branchName: string) => string;
  checkoutBranch: (branchName: string) => boolean;
  restackBranch: (
    branchName: string
  ) => 'REBASE_CONFLICT' | 'REBASE_DONE' | 'REBASE_UNNEEDED';
  continueRebase: () => 'REBASE_CONFLICT' | 'REBASE_DONE';
};

type TCachedMeta = { children: string[]; branchRevision: string } & (
  | {
      validationResult: 'TRUNK';
      parentBranchName: undefined;
    }
  | {
      validationResult: 'VALID';
      parentBranchName: string;
      parentBranchRevision: string;
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

// eslint-disable-next-line max-lines-per-function
export function composeMetaCache(trunkName?: string): TMetaCache {
  const cache = {
    currentBranch: getCurrentBranchName(),
    branches: trunkName ? loadCache(trunkName) : {},
  };

  const isBranchFixed = (branchName: string): boolean => {
    const cachedMeta = cache.branches[branchName];
    if (cachedMeta?.validationResult === 'TRUNK') {
      return true;
    }
    if (cachedMeta?.validationResult !== 'VALID') {
      return false;
    }
    return (
      cachedMeta.parentBranchRevision ===
      cache.branches[cachedMeta.parentBranchName].branchRevision
    );
  };

  const getValidMeta = (
    branchName: string | undefined
  ): TValidCachedMeta | undefined => {
    if (!branchName) return undefined;
    const cachedMeta = cache.branches[branchName];
    return cachedMeta?.validationResult === 'TRUNK' ||
      cachedMeta?.validationResult === 'VALID'
      ? cachedMeta
      : undefined;
  };

  function assertBranchIsValid(
    branchName: string | undefined
  ): asserts branchName is string {
    if (!getValidMeta(branchName)) {
      throw new PreconditionsFailedError(
        `${branchName} is not a valid Graphite branch.`
      );
    }
  }

  const handleRestack = (
    result: 'REBASE_CONFLICT' | 'REBASE_DONE'
  ): 'REBASE_CONFLICT' | 'REBASE_DONE' => {
    if (result === 'REBASE_CONFLICT') {
      cache.currentBranch = undefined;
      return 'REBASE_CONFLICT';
    }

    cache.currentBranch = getCurrentBranchName();
    assertBranchIsValid(cache.currentBranch);
    const cachedMeta = cache.branches[cache.currentBranch] as TValidCachedMeta;
    if (cachedMeta.validationResult === 'TRUNK') {
      throw new PreconditionsFailedError(
        `${cache.currentBranch} is trunk and cannot be restacked.`
      );
    }

    cachedMeta.parentBranchRevision =
      cache.branches[cachedMeta.parentBranchName].branchRevision;
    cachedMeta.branchRevision = getBranchRevision(cache.currentBranch);
    logDebug(`Restacked: ${cache.currentBranch}\n${cuteString(cachedMeta)}`);

    MetadataRef.updateOrCreate(cache.currentBranch, {
      parentBranchName: cachedMeta.parentBranchName,
      parentBranchRevision: cachedMeta.parentBranchRevision,
      prInfo: cachedMeta.prInfo,
    });
    return 'REBASE_DONE';
  };

  return {
    debug() {
      logDebug(cuteString(cache));
    },
    get currentBranch() {
      return cache.currentBranch;
    },
    get currentBranchPrecondition(): string {
      assertBranchIsValid(cache.currentBranch);
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
    getChildren: (branchName: string) =>
      cache.branches[branchName].children.filter(getValidMeta),
    getParent: (branchName: string) => {
      const meta = cache.branches[branchName];
      return meta.validationResult === 'BAD_PARENT_NAME'
        ? undefined
        : meta.parentBranchName;
    },
    getParentPrecondition: (branchName: string) => {
      const meta = cache.branches[branchName];
      if (
        meta.validationResult === 'BAD_PARENT_NAME' ||
        !meta.parentBranchName
      ) {
        throw new PreconditionsFailedError(
          `${branchName} does not have a parent.`
        );
      }
      return meta.parentBranchName;
    },
    checkoutBranch: (branchName: string): boolean => {
      if (!getValidMeta(branchName)) {
        return false;
      }
      checkoutBranch(branchName);
      cache.currentBranch = branchName;
      return true;
    },
    restackBranch: (branchName: string) => {
      assertBranchIsValid(branchName);
      if (isBranchFixed(branchName)) {
        return 'REBASE_UNNEEDED';
      }
      const cachedMeta = cache.branches[branchName] as TCachedMeta & {
        validationResult: 'VALID';
      };

      return handleRestack(
        restack({
          parentBranchName: cachedMeta.parentBranchName,
          oldParentBranchRevision: cachedMeta.parentBranchRevision,
          branchName,
        })
      );
    },
    continueRebase: () => {
      return handleRestack(restackContinue());
    },
  };
}

export function loadCache(trunkName: string): Record<string, TCachedMeta> {
  const branches: Record<string, TCachedMeta> = {};

  if (!branchExists(trunkName)) {
    return branches;
  }

  branches[trunkName] = {
    validationResult: 'TRUNK',
    parentBranchName: undefined,
    branchRevision: getBranchRevision(trunkName),
    children: [],
  };

  logDebug('Reading metadata...');
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
      logDebug(
        `bad parent name: ${branchName}\n\t${parentBranchName ?? 'missing'}`
      );
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
      logDebug(`invalid parent: ${branchName}`);
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
      logDebug(
        `bad parent rev: ${branchName}\n\t${parentBranchRevision ?? 'missing'}`
      );
      branches[branchName] = {
        validationResult: 'BAD_PARENT_REVISION',
        parentBranchName,
        branchRevision,
        children: [],
      };
      continue;
    }

    // This branch and its recursive parents are valid
    logDebug(`validated: ${branchName}`);
    branches[branchName] = {
      validationResult: 'VALID',
      parentBranchName,
      parentBranchRevision,
      branchRevision,
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
