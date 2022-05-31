import { PreconditionsFailedError } from '../errors';
import { branchMove } from '../git/branch_move';
import { commit, TCommitOpts } from '../git/commit';
import { getCommitRange, TCommitFormat } from '../git/commit_range';
import { getCurrentBranchName } from '../git/current_branch_name';
import { deleteBranch } from '../git/deleteBranch';
import { getBranchRevision } from '../git/get_branch_revision';
import { isEmptyBranch } from '../git/is_empty_branch';
import { isMerged } from '../git/is_merged';
import { rebaseInteractive, restack, restackContinue } from '../git/rebase';
import { switchBranch } from '../git/switch_branch';
import { cuteString } from '../utils/cute_string';
import { TSplog } from '../utils/splog';
import { loadCache as buildCache } from './build_cache';
import {
  assertCachedMetaIsNotTrunk,
  assertCachedMetaIsValidAndNotTrunk,
  assertCachedMetaIsValidOrTrunk,
} from './cached_meta';
import {
  deleteMetadataRef,
  TBranchPRInfo,
  writeMetadataRef,
} from './metadata_ref';
import { TScopeSpec } from './scope_spec';

export type TMetaCache = {
  debug: () => void;
  currentBranch: string | undefined;
  currentBranchPrecondition: string;
  trunk: string;
  allBranchNames: string[];
  isTrunk: (branchName: string) => boolean;
  getRevision: (branchName: string) => string;
  getBaseRevision: (branchName: string) => string;
  getAllCommits: (branchName: string, format: TCommitFormat) => string[];
  getPrInfo: (branchName: string) => TBranchPRInfo | undefined;
  upsertPrInfo: (branchName: string, prInfo: Partial<TBranchPRInfo>) => void;
  getChildren: (branchName: string) => string[];
  setParent: (branchName: string, parentBranchName: string) => void;
  getParent: (branchName: string) => string | undefined;
  getParentPrecondition: (branchName: string) => string;
  getRelativeStack: (branchName: string, scope: TScopeSpec) => string[];
  checkoutNewBranch: (branchName: string) => void;
  checkoutBranch: (branchName: string) => void;
  renameCurrentBranch: (branchName: string) => void;
  deleteBranch: (branchName: string) => string[];
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
  isMergedIntoTrunk: (branchName: string) => boolean;
  isBranchFixed: (branchName: string) => boolean;
  isBranchEmpty: (branchName: string) => boolean;
};

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
    branches: buildCache(trunkName, splog),
  };

  const assertBranch: (
    branchName: string | undefined
  ) => asserts branchName is string = (branchName) => {
    if (!branchName || !cache.branches[branchName]) {
      throw new PreconditionsFailedError(
        `${branchName} is unknown to Graphite.`
      );
    }
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

  const getChildren = (branchName: string) =>
    cache.branches[branchName].children.filter(
      (childBranchName) =>
        cache.branches[childBranchName]?.validationResult === 'VALID'
    );

  const getRecursiveChildren = (branchName: string): string[] =>
    getChildren(branchName).flatMap((child) => [
      child,
      ...getRecursiveChildren(child),
    ]);

  const removeChild = (parentBranchName: string, childBranchName: string) =>
    (cache.branches[parentBranchName].children = cache.branches[
      parentBranchName
    ].children.filter((child) => child !== childBranchName));
  const setParent = (branchName: string, parentBranchName: string) => {
    const cachedMeta = cache.branches[branchName];
    assertCachedMetaIsValidAndNotTrunk(cachedMeta);

    const oldParentBranchName = cachedMeta.parentBranchName;
    if (oldParentBranchName === parentBranchName) {
      return;
    }

    cachedMeta.parentBranchName = parentBranchName;
    persistMeta(branchName);

    removeChild(oldParentBranchName, branchName);
    cache.branches[parentBranchName].children.push(branchName);
  };

  const getParent = (branchName: string) => {
    const meta = cache.branches[branchName];
    return meta.validationResult === 'BAD_PARENT_NAME' ||
      meta.validationResult === 'TRUNK'
      ? undefined
      : meta.parentBranchName;
  };

  const getRecursiveParents = (branchName: string): string[] => {
    const parent = getParent(branchName);
    return parent ? [...getRecursiveParents(parent), parent] : [];
  };

  const checkoutBranch = (branchName: string) => {
    if (cache.currentBranch === branchName) {
      return;
    }
    assertBranch(branchName);
    switchBranch(branchName);
    cache.currentBranch = branchName;
  };

  const persistMeta = (branchName: string) => {
    assertBranch(branchName);
    const meta = cache.branches[branchName];
    assertCachedMetaIsValidAndNotTrunk(meta);

    writeMetadataRef(branchName, {
      parentBranchName: meta.parentBranchName,
      parentBranchRevision: meta.parentBranchRevision,
      prInfo: meta.prInfo,
    });
  };

  const handleRebase = (branchName: string) => {
    const cachedMeta = cache.branches[branchName];
    assertCachedMetaIsValidAndNotTrunk(cachedMeta);

    cachedMeta.parentBranchRevision =
      cache.branches[cachedMeta.parentBranchName].branchRevision;
    cachedMeta.branchRevision = getBranchRevision(branchName);
    splog.logDebug(
      `Cached meta for rebased branch ${branchName}:\n${cuteString(cachedMeta)}`
    );

    persistMeta(branchName);
    if (cache.currentBranch && cache.currentBranch in cache.branches) {
      switchBranch(cache.currentBranch);
    }
  };

  return {
    debug() {
      splog.logDebug(cuteString(cache));
    },
    get currentBranch() {
      return cache.currentBranch;
    },
    get currentBranchPrecondition(): string {
      assertBranch(cache.currentBranch);
      assertCachedMetaIsValidOrTrunk(cache.branches[cache.currentBranch]);
      return cache.currentBranch;
    },
    get trunk() {
      if (!trunkName) {
        throw new PreconditionsFailedError(`No trunk found.`);
      }
      return trunkName;
    },
    get allBranchNames() {
      return Object.keys(cache.branches);
    },
    isTrunk: (branchName: string) => branchName === trunkName,
    getRevision: (branchName: string) => {
      assertBranch(branchName);
      const meta = cache.branches[branchName];
      return meta.branchRevision;
    },
    getBaseRevision: (branchName: string) => {
      assertBranch(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(meta);
      return meta.parentBranchRevision;
    },
    getAllCommits: (branchName: string, format: TCommitFormat) => {
      assertBranch(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(meta);

      return getCommitRange(
        meta.parentBranchRevision,
        meta.branchRevision,
        format
      );
    },
    getPrInfo: (branchName: string) => {
      assertBranch(branchName);
      const meta = cache.branches[branchName];
      return meta.validationResult === 'TRUNK' ? undefined : meta.prInfo;
    },
    upsertPrInfo: (branchName: string, prInfo: Partial<TBranchPRInfo>) => {
      assertBranch(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(meta);
      meta.prInfo = { ...meta.prInfo, ...prInfo };
      persistMeta(branchName);
    },
    getChildren,
    setParent,
    getParent,
    getParentPrecondition: (branchName: string) => {
      assertBranch(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(meta);
      return meta.parentBranchName;
    },
    getRelativeStack: (branchName: string, scope: TScopeSpec) => {
      assertBranch(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsValidOrTrunk(meta);
      return [
        ...(scope.recursiveParents ? getRecursiveParents(branchName) : []),
        ...(scope.currentBranch ? [branchName] : []),
        ...(scope.recursiveChildren ? getRecursiveChildren(branchName) : []),
      ];
    },
    checkoutNewBranch: (branchName: string) => {
      const parentBranchName = cache.currentBranch;
      assertBranch(parentBranchName);
      const parentCachedMeta = cache.branches[parentBranchName];
      assertCachedMetaIsValidOrTrunk(parentCachedMeta);
      switchBranch(branchName, { new: true });

      cache.branches[branchName] = {
        validationResult: 'VALID',
        parentBranchName,
        parentBranchRevision: parentCachedMeta.branchRevision,
        branchRevision: parentCachedMeta.branchRevision,
        children: [],
      };
      persistMeta(branchName);
      cache.branches[parentBranchName].children.push(branchName);
      cache.currentBranch = branchName;
    },
    checkoutBranch,
    renameCurrentBranch: (branchName: string) => {
      assertBranch(cache.currentBranch);
      const cachedMeta = cache.branches[cache.currentBranch];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);

      branchMove(branchName);
      cachedMeta.prInfo = {};
      cache.branches[branchName] = cachedMeta;
      persistMeta(branchName);

      cachedMeta.children.forEach((childBranchName) =>
        setParent(childBranchName, branchName)
      );

      const parentCachedMeta = cache.branches[cachedMeta.parentBranchName];
      parentCachedMeta.children = parentCachedMeta.children.map(
        (childBranchName) =>
          childBranchName === cache.currentBranch ? branchName : childBranchName
      );

      delete cache.branches[cache.currentBranch];
      deleteMetadataRef(cache.currentBranch);
      cache.currentBranch = branchName;
    },
    deleteBranch: (branchName: string): string[] => {
      assertBranch(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);

      if (branchName === cache.currentBranch) {
        checkoutBranch(cachedMeta.parentBranchName);
      }

      const movedChildren: string[] = [];
      cachedMeta.children.forEach((childBranchName) => {
        setParent(childBranchName, cachedMeta.parentBranchName);
        movedChildren.push(childBranchName);
      });
      removeChild(cachedMeta.parentBranchName, branchName);

      deleteBranch(branchName);
      deleteMetadataRef(branchName);
      return movedChildren;
    },
    commit: (opts: TCommitOpts) => {
      assertBranch(cache.currentBranch);
      const cachedMeta = cache.branches[cache.currentBranch];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);
      commit(opts);
      cachedMeta.branchRevision = getBranchRevision(cache.currentBranch);
    },
    restackBranch: (branchName: string) => {
      assertBranch(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidOrTrunk(cachedMeta);
      if (isBranchFixed(branchName)) {
        return 'REBASE_UNNEEDED';
      }
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
      assertBranch(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);

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
      assertBranch(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);
      handleRebase(branchName);
      return { result, branchName };
    },
    isMergedIntoTrunk: (branchName: string) => {
      assertBranch(branchName);
      assertBranch(trunkName);
      return isMerged({ branchName, trunkName });
    },
    isBranchFixed,
    isBranchEmpty: (branchName: string) => {
      assertBranch(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);
      return isEmptyBranch(branchName, cachedMeta.parentBranchRevision);
    },
  };
}
