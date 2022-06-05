import { getSha } from '../git/get_sha';
import { getBranchNamesAndRevisions } from '../git/sorted_branch_names';
import { gpExecSync } from '../utils/exec_sync';
import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import { getMetadataRefList } from './metadata_ref';
import { parseBranchesAndMeta } from './parse_branches_and_meta';
import { hashCacheOrKey } from './persist_cache';

export const CACHE_CHECK_REF = 'GRAPHITE_CACHE_CHECK';
export const CACHE_DATA_REF = 'GRAPHITE_CACHE_DATA';

export function loadCachedBranches(
  args: { trunkName: string | undefined; ignorePersistedCache?: boolean },
  splog: TSplog
): Record<string, Readonly<TCachedMeta>> {
  splog.logDebug('Reading branches and metadata...');
  const cacheKey = {
    trunkName: args.trunkName,
    gitBranchNamesAndRevisions: getBranchNamesAndRevisions(),
    metadataRefList: getMetadataRefList(),
  };

  return (
    (args.ignorePersistedCache
      ? undefined
      : getPersistedCacheIfValid(cacheKey, splog)) ??
    parseBranchesAndMeta(
      {
        pruneMeta: true,
        gitBranchNamesAndRevisions: cacheKey.gitBranchNamesAndRevisions,
        metaRefNames: Object.keys(cacheKey.metadataRefList),
        trunkName: args.trunkName,
      },
      splog
    )
  );
}

export type TCacheKey = {
  trunkName: string | undefined;
  gitBranchNamesAndRevisions: Record<string, string>;
  metadataRefList: Record<string, string>;
};

function getPersistedCacheIfValid(
  cacheKey: TCacheKey,
  splog: TSplog
): Record<string, TCachedMeta> | undefined {
  const cacheCheckSha = getSha(CACHE_CHECK_REF);
  const currentStateSha = hashCacheOrKey(cacheKey);
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
