import { PreconditionsFailedError } from '../errors';
import { branchExists } from '../git/branch_exists';
import { branchMove } from '../git/branch_move';
import { switchBranch } from '../git/checkout_branch';
import { commit, TCommitOpts } from '../git/commit';
import { getCommitRange, TCommitFormat } from '../git/commit_range';
import { getCurrentBranchName } from '../git/current_branch_name';
import { deleteBranch } from '../git/deleteBranch';
import { getBranchRevision } from '../git/get_branch_revision';
import { isEmptyBranch } from '../git/is_empty_branch';
import { isMerged } from '../git/is_merged';
import { getMergeBase } from '../git/merge_base';
import { rebaseInteractive, restack, restackContinue } from '../git/rebase';
import { branchNamesAndRevisions } from '../git/sorted_branch_names';
import { cuteString } from '../utils/cute_string';
import { TSplog } from '../utils/splog';
import {
  allBranchesWithMeta,
  deleteMetadataRef,
  readMetadataRef,
  TBranchPRInfo,
  TMeta,
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
  resetPrInfo: (branchName: string) => void;
  upsertPrInfo: (branchName: string, prInfo: Partial<TBranchPRInfo>) => void;
  getChildren: (branchName: string) => string[];
  setParent: (branchName: string, parentBranchName: string) => void;
  getParent: (branchName: string) => string | undefined;
  getParentPrecondition: (branchName: string) => string;
  getCurrentStack: (scope: TScopeSpec) => string[];
  checkoutNewBranch: (branchName: string) => void;
  checkoutBranch: (branchName: string | undefined) => boolean;
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
  isMerged: (branchName: string) => boolean;
  isBranchFixed: (branchName: string) => boolean;
  isBranchEmpty: (branchName: string) => boolean;
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
    getChildren(branchName).flatMap((child) => [
      child,
      ...getRecursiveChildren(child),
    ]);

  const removeChild = (parentBranchName: string, childBranchName: string) =>
    (cache.branches[parentBranchName].children = cache.branches[
      parentBranchName
    ].children.filter((child) => child !== childBranchName));

  const setParent = (branchName: string, parentBranchName: string) => {
    assertBranchIsValid(branchName);
    const cachedMeta = cache.branches[branchName];
    assertCachedMetaIsNotTrunk(cachedMeta);

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
    return meta.validationResult === 'BAD_PARENT_NAME'
      ? undefined
      : meta.parentBranchName;
  };

  const getRecursiveParents = (branchName: string): string[] => {
    const parent = getParent(branchName);
    return parent ? [...getRecursiveParents(parent), parent] : [];
  };

  const checkoutBranch = (branchName: string | undefined): boolean => {
    try {
      assertBranchIsValid(branchName);
      switchBranch(branchName);
      cache.currentBranch = branchName;
      return true;
    } catch (e) {
      return false;
    }
  };

  const persistMeta = (branchName: string) => {
    const meta = cache.branches[branchName];
    assertCachedMetaIsNotTrunk(meta);

    writeMetadataRef(branchName, {
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
    switchBranch(cache.currentBranch);
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
    get allBranchNames() {
      return Object.keys(cache.branches);
    },
    isTrunk: (branchName: string) => branchName === trunkName,
    getRevision: (branchName: string) => {
      assertBranchIsValid(branchName);
      const meta = cache.branches[branchName];
      return meta.branchRevision;
    },
    getBaseRevision: (branchName: string) => {
      assertBranchIsValid(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(meta);
      return meta.parentBranchRevision;
    },
    getAllCommits: (branchName: string, format: TCommitFormat) => {
      assertBranchIsValid(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(meta);

      return getCommitRange(
        meta.parentBranchRevision,
        meta.branchRevision,
        format
      );
    },
    getPrInfo: (branchName: string) => {
      assertBranchIsValid(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(meta);
      return meta.prInfo;
    },
    resetPrInfo: (branchName: string) => {
      assertBranchIsValid(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(meta);

      meta.prInfo = {};
      persistMeta(branchName);
    },
    upsertPrInfo: (branchName: string, prInfo: Partial<TBranchPRInfo>) => {
      assertBranchIsValid(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(meta);

      meta.prInfo = { ...meta.prInfo, ...prInfo };
      persistMeta(branchName);
    },
    getChildren,
    setParent,
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
    checkoutNewBranch: (branchName: string) => {
      const parentBranchName = cache.currentBranch;
      assertBranchIsValid(parentBranchName);
      const parentCachedMeta = cache.branches[parentBranchName];
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
      assertBranchIsValid(cache.currentBranch);
      const cachedMeta = cache.branches[cache.currentBranch];
      assertCachedMetaIsNotTrunk(cachedMeta);

      branchMove(branchName);
      cachedMeta.prInfo = {};

      cache.branches[branchName] = cachedMeta;
      persistMeta(branchName);

      cachedMeta.children.forEach((childBranchName) =>
        setParent(childBranchName, branchName)
      );

      assertBranchIsValid(cachedMeta.parentBranchName);
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
      if (
        branchName === cache.currentBranch &&
        !checkoutBranch(getParent(branchName)) &&
        !checkoutBranch(trunkName)
      ) {
        // Give up if we can't check out the parent or trunk.
        throw new PreconditionsFailedError(`Cannot delete the current branch.`);
      }

      const meta = getValidMeta(branchName);
      const movedChildren: string[] = [];
      if (meta) {
        assertCachedMetaIsNotTrunk(meta);
        meta.children.forEach((childBranchName) => {
          setParent(childBranchName, meta.parentBranchName);
          movedChildren.push(childBranchName);
        });
        assertBranchIsValid(meta.parentBranchName);
        removeChild(meta.parentBranchName, branchName);
      }

      deleteBranch(branchName);
      deleteMetadataRef(branchName);
      return movedChildren;
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
    isMerged: (branchName: string) => {
      assertBranchIsValid(branchName);
      assertBranchIsValid(trunkName);
      return isMerged({ branchName, trunkName });
    },
    isBranchFixed,
    isBranchEmpty: (branchName: string) => {
      assertBranchIsValid(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(cachedMeta);
      return isEmptyBranch(branchName, cachedMeta.parentBranchRevision);
    },
  };
}

function loadCache(
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
  return allBranchesWithMeta()
    .filter((branchName) => {
      // As we read the refs, cleanup any whose branch is missing
      if (!gitBranchNamesAndRevisions.has(branchName)) {
        deleteMetadataRef(branchName);
        return false;
      }
      return true;
    })
    .map((branchName) => ({
      branchName,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      branchRevision: gitBranchNamesAndRevisions.get(branchName)!,
      ...readMetadataRef(branchName),
    }));
}
