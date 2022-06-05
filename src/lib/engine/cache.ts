import { PreconditionsFailedError } from '../errors';
import { branchMove } from '../git/branch_move';
import { commit, TCommitOpts } from '../git/commit';
import { getCommitRange, TCommitFormat } from '../git/commit_range';
import { getCurrentBranchName } from '../git/current_branch_name';
import { deleteBranch } from '../git/deleteBranch';
import {
  fetchBranch,
  readFetchBase,
  readFetchHead,
  writeFetchBase,
} from '../git/fetch_branch';
import { getRemoteSha, getShaOrThrow } from '../git/get_sha';
import { isEmptyBranch } from '../git/is_empty_branch';
import { isMerged } from '../git/is_merged';
import { getMergeBase } from '../git/merge_base';
import { pruneRemote } from '../git/prune_remote';
import { pullBranch } from '../git/pull_branch';
import { pushBranch } from '../git/push_branch';
import { rebaseInteractive, restack, restackContinue } from '../git/rebase';
import { setRemoteTracking } from '../git/set_remote_tracking';
import { switchBranch } from '../git/switch_branch';
import { forceCreateBranch } from '../git/write_branch';
import { cuteString } from '../utils/cute_string';
import { TSplog } from '../utils/splog';
import {
  assertCachedMetaIsNotTrunk,
  assertCachedMetaIsValidAndNotTrunk,
  assertCachedMetaIsValidOrTrunk,
  TValidCachedMetaExceptTrunk,
} from './cached_meta';
import { loadCachedBranches } from './cache_loader';
import {
  deleteMetadataRef,
  TBranchPRInfo,
  writeMetadataRef,
} from './metadata_ref';
import { persistCache } from './persist_cache';
import { TScopeSpec } from './scope_spec';

export type TMetaCache = {
  debug: () => void;
  persist: () => void;

  rebuild: (newTrunkName?: string) => void;
  trunk: string;
  isTrunk: (branchName: string) => boolean;

  branchExists: (branchName: string | undefined) => boolean;
  allBranchNames: string[];
  isBranchTracked: (branchName: string) => boolean;
  trackBranch: (
    branchName: string,
    parentBranchName: string
  ) => 'TRACKED' | 'NEEDS_REBASE';

  currentBranch: string | undefined;
  currentBranchPrecondition: string;

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
  deleteBranch: (branchName: string) => void;
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
  baseMatchesRemoteParent: (branchName: string) => boolean;

  pushBranch: (branchName: string) => void;
  pullTrunk: () => 'PULL_DONE' | 'PULL_UNNEEDED';

  fetchBranch: (
    branchName: string,
    parentBranchName: string
  ) => 'DOES_NOT_EXIST' | 'EXISTS_DIFFERENT_PARENTS' | 'EXISTS_SAME_PARENT';
  checkoutBranchFromFetched: (
    branchName: string,
    parentBranchName: string
  ) => void;
};

// eslint-disable-next-line max-lines-per-function
export function composeMetaCache({
  trunkName,
  currentBranchOverride,
  splog,
  noVerify,
  remote,
}: {
  trunkName?: string;
  currentBranchOverride?: string;
  splog: TSplog;
  noVerify: boolean;
  remote: string;
}): TMetaCache {
  const cache = {
    currentBranch: currentBranchOverride ?? getCurrentBranchName(),
    branches: loadCachedBranches({ trunkName }, splog),
  };

  const assertTrunk = () => {
    if (!trunkName) {
      throw new PreconditionsFailedError(`No trunk found.`);
    }
    return trunkName;
  };

  const branchExists = (branchName: string | undefined) =>
    branchName !== undefined && branchName in cache.branches;

  const assertBranch: (
    branchName: string | undefined
  ) => asserts branchName is string = (branchName) => {
    if (!branchExists(branchName)) {
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
    splog.logDebug(`${branchName} fixed?`);
    splog.logDebug(`${cachedMeta.parentBranchRevision}`);
    splog.logDebug(
      `${cache.branches[cachedMeta.parentBranchName].branchRevision}`
    );
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

  const removeChild = (parentBranchName: string, childBranchName: string) => {
    assertBranch(parentBranchName);
    const parentCachedChildren = cache.branches[parentBranchName].children;
    const index = parentCachedChildren.indexOf(childBranchName);
    if (index > -1) {
      parentCachedChildren.splice(index, 1);
    }
  };
  const setParent = (branchName: string, parentBranchName: string) => {
    const cachedMeta = cache.branches[branchName];
    assertCachedMetaIsValidAndNotTrunk(cachedMeta);

    const oldParentBranchName = cachedMeta.parentBranchName;
    if (oldParentBranchName === parentBranchName) {
      return;
    }

    updateMeta(branchName, { ...cachedMeta, parentBranchName });
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

  // Any writes should go through this function, which:
  // Validates the new metadata
  // Updates children of the old+new parent
  // Writes to disk
  // TODO Revalidates 'INVALID_PARENT' children
  const updateMeta = (
    branchName: string,
    newCachedMeta: TValidCachedMetaExceptTrunk
  ) => {
    // Get current meta and ensure this branch isn't trunk.
    const oldCachedMeta = cache.branches[branchName] ?? {
      validationResult: 'BAD_PARENT_NAME',
      branchRevision: getShaOrThrow(branchName),
      children: [],
    };
    assertCachedMetaIsNotTrunk(oldCachedMeta);

    // Get new cached meta and handle updating children
    cache.branches[branchName] = newCachedMeta;
    const oldParentBranchName =
      oldCachedMeta.validationResult === 'BAD_PARENT_NAME'
        ? undefined
        : oldCachedMeta.parentBranchName;
    const newParentBranchName = newCachedMeta.parentBranchName;
    assertBranch(newParentBranchName);

    if (oldParentBranchName !== newParentBranchName) {
      if (oldParentBranchName && oldParentBranchName in cache.branches) {
        removeChild(oldParentBranchName, branchName);
      }
      cache.branches[newParentBranchName].children.push(branchName);
    }

    // Write to disk
    writeMetadataRef(branchName, {
      parentBranchName: newCachedMeta.parentBranchName,
      parentBranchRevision: newCachedMeta.parentBranchRevision,
      prInfo: newCachedMeta.prInfo,
    });

    splog.logDebug(
      `Updated cached meta for branch ${branchName}:\n${cuteString(
        newCachedMeta
      )}`
    );
  };

  const handleRebase = (branchName: string) => {
    const cachedMeta = cache.branches[branchName];
    assertCachedMetaIsValidAndNotTrunk(cachedMeta);

    updateMeta(branchName, {
      ...cachedMeta,
      branchRevision: getShaOrThrow(branchName),
      parentBranchRevision:
        cache.branches[cachedMeta.parentBranchName].branchRevision,
    });

    if (cache.currentBranch && cache.currentBranch in cache.branches) {
      switchBranch(cache.currentBranch);
    }
  };

  return {
    debug() {
      splog.logDebug(cuteString(cache));
    },
    persist() {
      persistCache(trunkName, cache.branches, splog);
    },
    rebuild(newTrunkName?: string) {
      cache.branches = loadCachedBranches(
        { trunkName: newTrunkName ?? trunkName, ignorePersistedCache: true },
        splog
      );
    },
    get trunk() {
      return assertTrunk();
    },
    isTrunk: (branchName: string) => branchName === trunkName,
    branchExists,
    get allBranchNames() {
      return Object.keys(cache.branches);
    },
    isBranchTracked: (branchName: string) => {
      assertBranch(branchName);
      return cache.branches[branchName].validationResult === 'VALID';
    },
    trackBranch: (branchName: string, parentBranchName: string) => {
      assertBranch(branchName);
      assertBranch(parentBranchName);

      const parentMeta = cache.branches[parentBranchName];
      assertCachedMetaIsValidOrTrunk(parentMeta);

      const mergeBase = getMergeBase(branchName, parentBranchName);

      // We allow children of trunk to be tracked even if they are behind.
      // So only fail if the parent is not trunk AND the branch is behind
      if (
        parentMeta.validationResult !== 'TRUNK' &&
        mergeBase !== parentMeta.branchRevision
      ) {
        return 'NEEDS_REBASE';
      }

      updateMeta(branchName, {
        ...cache.branches[branchName],
        validationResult: 'VALID',
        parentBranchName,
        // This is parentMeta.branchRevision unless parent is trunk
        parentBranchRevision: mergeBase,
      });
      return 'TRACKED';
    },
    get currentBranch() {
      return cache.currentBranch;
    },
    get currentBranchPrecondition(): string {
      assertBranch(cache.currentBranch);
      assertCachedMetaIsValidOrTrunk(cache.branches[cache.currentBranch]);
      return cache.currentBranch;
    },
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
      const meta = cache.branches[branchName];
      return meta?.validationResult === 'TRUNK' ? undefined : meta.prInfo;
    },
    upsertPrInfo: (branchName: string, prInfo: Partial<TBranchPRInfo>) => {
      const meta = cache.branches[branchName];
      if (meta?.validationResult !== 'VALID') {
        return;
      }
      updateMeta(branchName, {
        ...meta,
        prInfo: { ...meta.prInfo, ...prInfo },
      });
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

      updateMeta(branchName, {
        validationResult: 'VALID',
        parentBranchName,
        parentBranchRevision: parentCachedMeta.branchRevision,
        branchRevision: parentCachedMeta.branchRevision,
        children: [],
      });
      cache.currentBranch = branchName;
    },
    checkoutBranch,
    renameCurrentBranch: (branchName: string) => {
      assertBranch(cache.currentBranch);
      const cachedMeta = cache.branches[cache.currentBranch];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);

      branchMove(branchName);
      updateMeta(branchName, { ...cachedMeta, prInfo: {} });

      cachedMeta.children.forEach((childBranchName) =>
        setParent(childBranchName, branchName)
      );

      delete cache.branches[cache.currentBranch];
      deleteMetadataRef(cache.currentBranch);
      cache.currentBranch = branchName;
    },
    deleteBranch: (branchName: string) => {
      assertBranch(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);

      if (branchName === cache.currentBranch) {
        checkoutBranch(cachedMeta.parentBranchName);
      }

      cachedMeta.children.forEach((childBranchName) =>
        setParent(childBranchName, cachedMeta.parentBranchName)
      );
      removeChild(cachedMeta.parentBranchName, branchName);

      delete cache.branches[branchName];
      deleteBranch(branchName);
      deleteMetadataRef(branchName);
    },
    commit: (opts: TCommitOpts) => {
      assertBranch(cache.currentBranch);
      const cachedMeta = cache.branches[cache.currentBranch];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);
      commit({ ...opts, noVerify });
      cache.branches[cache.currentBranch] = {
        ...cachedMeta,
        branchRevision: getShaOrThrow(cache.currentBranch),
      };
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
          parentBranchName: cachedMeta.parentBranchName,
          parentBranchRevision: cachedMeta.parentBranchRevision,
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
          parentBranchRevision: cachedMeta.parentBranchRevision,
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
    baseMatchesRemoteParent: (branchName: string) => {
      assertBranch(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);
      const remoteParentRevision = getRemoteSha(
        cachedMeta.parentBranchName,
        remote
      );
      splog.logDebug(`${branchName} base matches remote?`);
      splog.logDebug(cachedMeta.parentBranchRevision);
      splog.logDebug(remoteParentRevision ?? '');

      return cachedMeta.parentBranchRevision === remoteParentRevision;
    },
    pushBranch: (branchName: string) => {
      assertBranch(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);
      pushBranch({ remote, branchName, noVerify });
    },
    pullTrunk: () => {
      pruneRemote(remote);
      assertBranch(cache.currentBranch);
      const trunkName = assertTrunk();
      const oldTrunkCachedMeta = cache.branches[trunkName];
      try {
        switchBranch(trunkName);
        pullBranch(remote, trunkName);
        const newTrunkRevision = getShaOrThrow(trunkName);
        cache.branches[trunkName] = {
          ...oldTrunkCachedMeta,
          branchRevision: newTrunkRevision,
        };
        return oldTrunkCachedMeta.branchRevision === newTrunkRevision
          ? 'PULL_UNNEEDED'
          : 'PULL_DONE';
      } finally {
        switchBranch(cache.currentBranch);
      }
    },
    fetchBranch: (branchName: string, parentBranchName: string) => {
      assertBranch(parentBranchName);
      const parentMeta = cache.branches[parentBranchName];
      assertCachedMetaIsValidOrTrunk(parentMeta);
      if (parentMeta.validationResult === 'TRUNK') {
        // If this is a trunk-child, its base is its merge base with trunk.
        fetchBranch(remote, branchName);
        writeFetchBase(
          getMergeBase(readFetchHead(), parentMeta.branchRevision)
        );
      } else {
        // Otherwise, its base is the head of the previous fetch
        writeFetchBase(readFetchHead());
        fetchBranch(remote, branchName);
      }

      if (!branchExists(branchName)) {
        return 'DOES_NOT_EXIST';
      }

      const existingMeta = cache.branches[branchName];
      if (
        existingMeta.validationResult !== 'VALID' ||
        existingMeta.parentBranchName !== parentBranchName
      ) {
        return 'EXISTS_DIFFERENT_PARENTS';
      }

      return 'EXISTS_SAME_PARENT';
    },
    checkoutBranchFromFetched: (
      branchName: string,
      parentBranchName: string
    ) => {
      const { head, base } = { head: readFetchHead(), base: readFetchBase() };
      forceCreateBranch(branchName, head);
      setRemoteTracking({ remote, branchName, sha: head });

      updateMeta(branchName, {
        validationResult: 'VALID',
        parentBranchName,
        parentBranchRevision: base,
        branchRevision: head,
        children: [],
      });
      cache.currentBranch = branchName;
    },
  };
}
