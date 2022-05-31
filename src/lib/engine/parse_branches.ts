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
export function parseBranchesAndMeta(
  trunkName: string | undefined,
  splog: TSplog
): Record<string, TCachedMeta> {
  splog.logDebug('Reading branches and metadata...');
  const branchesToParse = getAllBranchesAndMeta(splog);
  const allBranchNames = new Set(
    branchesToParse.map((meta) => meta.branchName)
  );
  const parsedBranches: Record<string, TCachedMeta> = {};

  splog.logDebug('Validating branches...');
  while (branchesToParse.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const current = branchesToParse.shift()!;
    const {
      branchName,
      branchRevision,
      parentBranchName,
      parentBranchRevision,
      prInfo,
    } = current;

    if (branchName === trunkName) {
      splog.logDebug(`trunk: ${branchName}`);
      parsedBranches[branchName] = {
        validationResult: 'TRUNK',
        branchRevision: branchRevision,
        children: [],
      };
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
      parsedBranches[branchName] = {
        validationResult: 'BAD_PARENT_NAME',
        branchRevision,
        prInfo,
        children: [],
      };
      continue;
    }

    // If parent hasn't been checked yet, we'll come back to this branch
    const parentCachedMeta = parsedBranches[parentBranchName];
    if (typeof parentCachedMeta === 'undefined') {
      branchesToParse.push(current);
      continue;
    }

    parentCachedMeta.children.push(branchName);

    // Check if the parent is valid (or trunk)
    if (
      parentCachedMeta.validationResult !== 'VALID' &&
      parentCachedMeta.validationResult !== 'TRUNK'
    ) {
      splog.logDebug(`invalid parent: ${branchName}`);
      parsedBranches[branchName] = {
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
        parsedBranches[branchName] = {
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
        parsedBranches[branchName] = {
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
    parsedBranches[branchName] = {
      validationResult: 'VALID',
      parentBranchName,
      parentBranchRevision,
      branchRevision,
      prInfo,
      children: [],
    };
  }

  return parsedBranches;
}

type TBranchToParse = { branchName: string; branchRevision: string } & TMeta;
function getAllBranchesAndMeta(splog: TSplog): TBranchToParse[] {
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
