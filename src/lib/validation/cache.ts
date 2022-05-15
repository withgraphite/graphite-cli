import {
  MetadataRef,
  TBranchPRInfo,
  TMeta,
} from '../../wrapper-classes/metadata_ref';
import { getBranchRevision } from '../git/get_branch_revision';
import { getMergeBase } from '../git/merge_base';
import { branchNamesAndRevisions } from '../git/sorted_branch_names';
import { logDebug } from '../utils/splog';

export type TMetaCache = Map<string, TCachedMeta>;
type TCachedMeta = { children: string[]; branchRevision: string } & (
  | {
      validationResult: 'TRUNK';
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

export function loadCache(trunkName: string): TMetaCache {
  const cache: TMetaCache = new Map();

  cache.set(trunkName, {
    validationResult: 'TRUNK',
    branchRevision: getBranchRevision(trunkName),
    fixed: true,
    children: [],
  });

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
      logDebug(`bad parent name: ${branchName}`);
      cache.set(branchName, {
        validationResult: 'BAD_PARENT_NAME',
        branchRevision,
        children: [],
      });
      continue;
    }

    // If parent hasn't been checked yet, we'll come back to this branch
    const parentCachedMeta = cache.get(parentBranchName);
    if (typeof parentCachedMeta === 'undefined') {
      metaToValidate.push(current);
      continue;
    }

    // Check if the parent is valid (or trunk)
    if (
      parentCachedMeta.validationResult !== 'VALID' &&
      parentCachedMeta.validationResult !== 'TRUNK'
    ) {
      logDebug(`invalid parent: ${branchName}`);
      cache.set(branchName, {
        validationResult: 'INVALID_PARENT',
        parentBranchName,
        parentBranchRevision,
        branchRevision,
        children: [],
      });
      continue;
    }

    // Check parentBranchRevision
    if (
      !parentBranchRevision ||
      getMergeBase(branchName, parentBranchRevision) !== parentBranchRevision
    ) {
      logDebug(`bad parent rev: ${branchName}`);
      cache.set(branchName, {
        validationResult: 'BAD_PARENT_REVISION',
        parentBranchName,
        branchRevision,
        children: [],
      });
      continue;
    }

    // This branch and its recursive parents are valid
    logDebug(`validated: ${branchName}`);
    parentCachedMeta.children.push(branchName);
    cache.set(branchName, {
      validationResult: 'VALID',
      parentBranchName,
      parentBranchRevision,
      branchRevision,
      fixed: parentBranchRevision === parentCachedMeta.branchRevision,
      children: [],
    });
  }

  return cache;
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
