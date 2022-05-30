import { branchExists } from '../git/branch_exists';
import { getBranchRevision } from '../git/get_branch_revision';
import { getMergeBase } from '../git/merge_base';
import { branchNamesAndRevisions } from '../git/sorted_branch_names';
import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import {
  allBranchesWithMeta,
  deleteMetadataRef,
  readMetadataRef,
  TMeta,
  writeMetadataRef,
} from './metadata_ref';

// eslint-disable-next-line max-lines-per-function
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
