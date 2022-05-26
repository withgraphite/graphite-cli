import {
  MetadataRef,
  TBranchPRInfo,
  TMeta,
} from '../../wrapper-classes/metadata_ref';
import { PreconditionsFailedError } from '../errors';
import { branchExists } from '../git/branch_exists';
import { checkoutBranch } from '../git/checkout_branch';
import { commit, TCommitOpts } from '../git/commit';
import { getCurrentBranchName } from '../git/current_branch_name';
import { getBranchRevision } from '../git/get_branch_revision';
import { getMergeBase } from '../git/merge_base';
import { rebaseInteractive, restack, restackContinue } from '../git/rebase';
import { branchNamesAndRevisions } from '../git/sorted_branch_names';
import { cuteString } from '../utils/cute_string';
import { TSplog } from '../utils/splog';
import { TScopeSpec } from './scope_spec';

export type TMetaCache = {
  debug: () => void;
  currentBranch: string | undefined;
  currentBranchPrecondition: string;
  trunk: string;
  isTrunk: (branchName: string) => boolean;
  getChildren: (branchName: string) => string[];
  setParent: (branchName: string, parentBranchName: string) => void;
  getParent: (branchName: string) => string | undefined;
  getParentPrecondition: (branchName: string) => string;
  getCurrentStack: (scope: TScopeSpec) => string[];
  checkoutBranch: (branchName: string) => boolean;
  commit: (opts: TCommitOpts) => void;
  restackBranch: (
    branchName: string
  ) => 'REBASE_CONFLICT' | 'REBASE_DONE' | 'REBASE_UNNEEDED';
  rebaseInteractive: (branchName: string) => 'REBASE_CONFLICT' | 'REBASE_DONE';
  continueRebase: () =>
    | {
        result: 'REBASE_DONE';
        branchName: string;
      }
    | { result: 'REBASE_CONFLICT' };
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
type TValidNonTrunkCachedMeta = TCachedMeta & { validationResult: 'VALID' };

// eslint-disable-next-line max-lines-per-function
export function composeMetaCache({
  trunkName,
  currentBranchOverride,
  splog,
}: {
  trunkName?: string;
  currentBranchOverride?: string;
  splog: TSplog;
}): TMetaCache {
  const cache = {
    currentBranch: currentBranchOverride ?? getCurrentBranchName(),
    branches: loadCache(trunkName, splog),
  };

  const isBranchFixed = (branchName: string): boolean => {
    const cachedMeta = cache.branches[branchName];
    if (cachedMeta?.validationResult === 'TRUNK') {
      return true;
    }
    if (cachedMeta?.validationResult !== 'VALID') {
      return false;
    }
    splog.logDebug(
      `Checking if ${branchName} is fixed:\nparentBranchRevision: ${
        cachedMeta.parentBranchRevision
      }\nparent.branchRevision:${
        cache.branches[cachedMeta.parentBranchName].branchRevision
      }`
    );
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

  function assertCachedMetaIsNotTrunk(
    meta: TCachedMeta
  ): asserts meta is TValidNonTrunkCachedMeta {
    if (meta.validationResult === 'TRUNK') {
      throw new PreconditionsFailedError(
        `Cannot perform this operation on the trunk branch.`
      );
    }
  }

  const getChildren = (branchName: string) =>
    cache.branches[branchName].children.filter(getValidMeta);

  const getRecursiveChildren = (branchName: string): string[] =>
    getChildren(branchName)
      .map((child) => [child, ...getRecursiveChildren(child)])
      .reduce((last: string[], current: string[]) => [...last, ...current], []);

  const getParent = (branchName: string) => {
    const meta = cache.branches[branchName];
    return meta.validationResult === 'BAD_PARENT_NAME'
      ? undefined
      : meta.parentBranchName;
  };

  const getRecursiveParents = (branchName: string): string[] => {
    const parent = getParent(branchName);
    return parent ? [...getRecursiveParents(parent), parent] : [];
  };

  const persistMeta = (branchName: string) => {
    const meta = cache.branches[branchName];
    assertCachedMetaIsNotTrunk(meta);

    MetadataRef.updateOrCreate(branchName, {
      parentBranchName: meta.parentBranchName,
      parentBranchRevision: meta.parentBranchRevision,
      prInfo: meta.prInfo,
    });
  };

  const handleRebase = (branchName: string) => {
    const cachedMeta = cache.branches[branchName];
    assertCachedMetaIsNotTrunk(cachedMeta);

    cachedMeta.parentBranchRevision =
      cache.branches[cachedMeta.parentBranchName].branchRevision;
    cachedMeta.branchRevision = getBranchRevision(branchName);
    splog.logDebug(
      `Cached meta for rebased branch ${branchName}:\n${cuteString(cachedMeta)}`
    );

    persistMeta(branchName);
    assertBranchIsValid(cache.currentBranch);
    checkoutBranch(cache.currentBranch);
  };

  return {
    debug() {
      splog.logDebug(cuteString(cache));
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
    getChildren,
    setParent: (branchName: string, parentBranchName: string) => {
      assertBranchIsValid(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(cachedMeta);

      const oldParentBranchName = cachedMeta.parentBranchName;

      cachedMeta.parentBranchName = parentBranchName;
      persistMeta(branchName);

      cache.branches[parentBranchName].children.push(branchName);
      cache.branches[oldParentBranchName].children = cache.branches[
        oldParentBranchName
      ].children.filter((child) => child !== branchName);
    },
    getParent,
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
    getCurrentStack: (scope: TScopeSpec) => {
      assertBranchIsValid(cache.currentBranch);
      return [
        ...(scope.recursiveParents
          ? getRecursiveParents(cache.currentBranch)
          : []),
        ...(scope.currentBranch ? [cache.currentBranch] : []),
        ...(scope.recursiveChildren
          ? getRecursiveChildren(cache.currentBranch)
          : []),
      ];
    },
    checkoutBranch: (branchName: string): boolean => {
      if (!getValidMeta(branchName)) {
        return false;
      }
      checkoutBranch(branchName);
      cache.currentBranch = branchName;
      return true;
    },
    commit: (opts: TCommitOpts) => {
      assertBranchIsValid(cache.currentBranch);
      const cachedMeta = cache.branches[cache.currentBranch];
      assertCachedMetaIsNotTrunk(cachedMeta);
      commit(opts);
      cachedMeta.branchRevision = getBranchRevision(cache.currentBranch);
    },
    restackBranch: (branchName: string) => {
      assertBranchIsValid(branchName);
      if (isBranchFixed(branchName)) {
        return 'REBASE_UNNEEDED';
      }
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(cachedMeta);

      if (
        restack({
          branchName,
          ...cachedMeta,
        }) === 'REBASE_CONFLICT'
      ) {
        return 'REBASE_CONFLICT';
      }

      handleRebase(branchName);
      return 'REBASE_DONE';
    },
    rebaseInteractive: (branchName: string) => {
      assertBranchIsValid(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(cachedMeta);

      if (
        rebaseInteractive({
          branchName,
          ...cachedMeta,
        }) === 'REBASE_CONFLICT'
      ) {
        return 'REBASE_CONFLICT';
      }

      handleRebase(branchName);
      return 'REBASE_DONE';
    },
    continueRebase: () => {
      const result = restackContinue();
      if (result === 'REBASE_CONFLICT') {
        return { result };
      }
      const branchName = getCurrentBranchName();
      assertBranchIsValid(branchName);
      handleRebase(branchName);
      return { result, branchName };
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

  if (!branchExists(trunkName)) {
    return branches;
  }

  branches[trunkName] = {
    validationResult: 'TRUNK',
    parentBranchName: undefined,
    branchRevision: getBranchRevision(trunkName),
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
      prInfo,
    } = current;

    // Check parentBranchName
    if (
      !parentBranchName ||
      parentBranchName === branchName ||
      !allBranchNames.has(parentBranchName)
    ) {
      splog.logDebug(
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
      splog.logDebug(
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
    splog.logDebug(`validated: ${branchName}`);
    branches[branchName] = {
      validationResult: 'VALID',
      parentBranchName,
      parentBranchRevision,
      branchRevision,
      prInfo,
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
