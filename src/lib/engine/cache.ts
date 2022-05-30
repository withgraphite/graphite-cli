import { PreconditionsFailedError } from '../errors';
import { branchExists } from '../git/branch_exists';
import { branchMove } from '../git/branch_move';
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
import { switchBranch } from '../git/switch_branch';
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

type TCachedMeta = {
  children: string[];
  branchRevision: string;
} & (
  | { validationResult: 'TRUNK' }
  | ((
      | {
          validationResult: 'VALID';
          parentBranchName: string;
          parentBranchRevision: string;
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
    ) & {
      prInfo?: TBranchPRInfo;
    })
);

type TValidCachedMeta = TCachedMeta & { validationResult: 'TRUNK' | 'VALID' };
type TNonTrunkCachedMeta = Exclude<TCachedMeta, { validationResult: 'TRUNK' }>;
type TValidCachedMetaExceptTrunk = TValidCachedMeta & TNonTrunkCachedMeta;

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

  function assertBranchIsInCache(
    branchName: string | undefined
  ): asserts branchName is string {
    if (!branchName || !cache.branches[branchName]) {
      throw new PreconditionsFailedError(
        `${branchName} is unknown to Graphite.`
      );
    }
  }

  function assertCachedMetaIsValidAndNotTrunk(
    meta: TCachedMeta
  ): asserts meta is TValidCachedMetaExceptTrunk {
    if (meta.validationResult !== 'VALID') {
      throw new PreconditionsFailedError(
        `Cannot perform this operation on this branch (invalid or trunk).`
      );
    }
  }

  function assertCachedMetaIsValidOrTrunk(
    meta: TCachedMeta
  ): asserts meta is TValidCachedMeta {
    if (
      meta.validationResult !== 'VALID' &&
      meta.validationResult !== 'TRUNK'
    ) {
      throw new PreconditionsFailedError(
        `Cannot perform this operation on the trunk branch (invalid).`
      );
    }
  }

  function assertCachedMetaIsNotTrunk(
    meta: TCachedMeta
  ): asserts meta is TNonTrunkCachedMeta {
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
    assertBranchIsInCache(branchName);
    switchBranch(branchName);
    cache.currentBranch = branchName;
  };

  const persistMeta = (branchName: string) => {
    assertBranchIsInCache(branchName);
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
      assertBranchIsInCache(cache.currentBranch);
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
      assertBranchIsInCache(branchName);
      const meta = cache.branches[branchName];
      return meta.branchRevision;
    },
    getBaseRevision: (branchName: string) => {
      assertBranchIsInCache(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(meta);
      return meta.parentBranchRevision;
    },
    getAllCommits: (branchName: string, format: TCommitFormat) => {
      assertBranchIsInCache(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(meta);

      return getCommitRange(
        meta.parentBranchRevision,
        meta.branchRevision,
        format
      );
    },
    getPrInfo: (branchName: string) => {
      assertBranchIsInCache(branchName);
      const meta = cache.branches[branchName];
      return meta.validationResult === 'TRUNK' ? undefined : meta.prInfo;
    },
    upsertPrInfo: (branchName: string, prInfo: Partial<TBranchPRInfo>) => {
      assertBranchIsInCache(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsNotTrunk(meta);
      meta.prInfo = { ...meta.prInfo, ...prInfo };
      persistMeta(branchName);
    },
    getChildren,
    setParent,
    getParent,
    getParentPrecondition: (branchName: string) => {
      assertBranchIsInCache(branchName);
      const meta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(meta);
      return meta.parentBranchName;
    },
    getRelativeStack: (branchName: string, scope: TScopeSpec) => {
      assertBranchIsInCache(branchName);
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
      assertBranchIsInCache(parentBranchName);
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
      assertBranchIsInCache(cache.currentBranch);
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
      assertBranchIsInCache(branchName);
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
      assertBranchIsInCache(cache.currentBranch);
      const cachedMeta = cache.branches[cache.currentBranch];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);
      commit(opts);
      cachedMeta.branchRevision = getBranchRevision(cache.currentBranch);
    },
    restackBranch: (branchName: string) => {
      assertBranchIsInCache(branchName);
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
      assertBranchIsInCache(branchName);
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
      assertBranchIsInCache(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);
      handleRebase(branchName);
      return { result, branchName };
    },
    isMergedIntoTrunk: (branchName: string) => {
      assertBranchIsInCache(branchName);
      assertBranchIsInCache(trunkName);
      return isMerged({ branchName, trunkName });
    },
    isBranchFixed,
    isBranchEmpty: (branchName: string) => {
      assertBranchIsInCache(branchName);
      const cachedMeta = cache.branches[branchName];
      assertCachedMetaIsValidAndNotTrunk(cachedMeta);
      return isEmptyBranch(branchName, cachedMeta.parentBranchRevision);
    },
  };
}

// eslint-disable-next-line max-lines-per-function
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
    branchRevision: getBranchRevision(trunkName),
    children: [],
  };

  splog.logDebug('Reading branches and metadata...');
  const metaToValidate = readAllBranchesAndMeta(splog);
  const allBranchNames = new Set(metaToValidate.map((meta) => meta.branchName));

  splog.logDebug('Validating branches...');
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

    if (branchName === trunkName) {
      continue;
    }

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
        prInfo,
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
        prInfo,
        children: [],
      };
      continue;
    }

    // Check parentBranchRevision
    if (
      !parentBranchRevision ||
      getMergeBase(branchName, parentBranchRevision) !== parentBranchRevision
    ) {
      if (
        getMergeBase(branchName, parentCachedMeta.branchRevision) !==
        parentCachedMeta.branchRevision
      ) {
        splog.logDebug(
          `bad parent rev: ${branchName}\n\t${
            parentBranchRevision ?? 'missing'
          }`
        );
        branches[branchName] = {
          validationResult: 'BAD_PARENT_REVISION',
          parentBranchName,
          branchRevision,
          prInfo,
          children: [],
        };
        continue;
      } else {
        writeMetadataRef(branchName, {
          parentBranchName,
          parentBranchRevision: parentCachedMeta.branchRevision,
          prInfo,
        });
        splog.logDebug(
          `validated and fixed parent rev: ${branchName}\n\t${parentCachedMeta.branchRevision}`
        );
        branches[branchName] = {
          validationResult: 'VALID',
          parentBranchName,
          parentBranchRevision: parentCachedMeta.branchRevision,
          branchRevision,
          prInfo,
          children: [],
        };
        continue;
      }
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

type TMetaToValidate = { branchName: string; branchRevision: string } & TMeta;
function readAllBranchesAndMeta(splog: TSplog): TMetaToValidate[] {
  const gitBranchNamesAndRevisions = branchNamesAndRevisions();

  const branchesWithMeta = new Set(
    allBranchesWithMeta().filter((branchName) => {
      if (gitBranchNamesAndRevisions[branchName]) {
        return true;
      }
      // Clean up refs whose branch is missing
      splog.logDebug(`Deleting metadata for missing branch: ${branchName}`);
      deleteMetadataRef(branchName);
      return false;
    })
  );

  return Object.keys(gitBranchNamesAndRevisions).map((branchName) => ({
    branchName,
    branchRevision: gitBranchNamesAndRevisions[branchName],
    ...(branchesWithMeta.has(branchName) ? readMetadataRef(branchName) : {}),
  }));
}
