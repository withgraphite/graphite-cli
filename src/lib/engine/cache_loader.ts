import { getSha } from '../git/get_sha';
import { getMergeBase } from '../git/merge_base';
import { cuteString } from '../utils/cute_string';
import { gpExecSync } from '../utils/exec_sync';
import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import { writeMetadataRef } from './metadata_ref';
import { hashState } from './persist_cache';
import { getAllBranchesAndMeta, TBranchToParse } from './readBranchesAndMeta';

export const CACHE_CHECK_REF = 'GRAPHITE_CACHE_CHECK';
export const CACHE_DATA_REF = 'GRAPHITE_CACHE_DATA';

export function loadCachedBranches(
  args: { trunkName: string | undefined; ignorePersistedCache?: boolean },
  splog: TSplog
): Record<string, TCachedMeta> {
  splog.logDebug('Reading branches and metadata...');
  const allBranchesAndMeta = getAllBranchesAndMeta(splog, /*pruneMeta: */ true);

  return (
    (args.ignorePersistedCache
      ? undefined
      : getPersistedCacheIfValid(
          { trunkName: args.trunkName, allBranchesAndMeta },
          splog
        )) ?? parseBranchesAndMeta(allBranchesAndMeta, args.trunkName, splog)
  );
}

type TPersistedState = {
  trunkName: string | undefined;
  allBranchesAndMeta: TBranchToParse[];
};

function getPersistedCacheIfValid(
  state: TPersistedState,
  splog: TSplog
): Record<string, TCachedMeta> | undefined {
  const cacheCheckSha = getSha(CACHE_CHECK_REF);
  const currentStateSha = hashState(cuteString(state));
  splog.logDebug(`Cache check SHA: ${cacheCheckSha}`);
  splog.logDebug(`Current state SHA: ${currentStateSha}`);

  return cacheCheckSha === currentStateSha ? readPersistedCache() : undefined;
}

function readPersistedCache(): Record<string, TCachedMeta> | undefined {
  // TODO: validate with retype
  try {
    return JSON.parse(
      gpExecSync({
        command: `git cat-file -p ${CACHE_DATA_REF}`,
      })
    );
  } catch {
    return undefined;
  }
}

// eslint-disable-next-line max-lines-per-function
function parseBranchesAndMeta(
  branchesToParse: TBranchToParse[],
  trunkName: string | undefined,
  splog: TSplog
): Record<string, TCachedMeta> {
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
