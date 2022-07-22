import { createHash } from 'crypto';
import { version } from '../../../package.json';
import { getRebaseHead } from '../git/merge_conflict_help';
import { getBranchNamesAndRevisions } from '../git/sorted_branch_names';
import { cachePersistenceFactory } from '../spiffy/cache_spf';
import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import { getMetadataRefList } from './metadata_ref';
import { parseBranchesAndMeta, TCacheSeed } from './parse_branches_and_meta';

type TCacheLoader = {
  loadCachedBranches(
    trunkName: string | undefined
  ): Record<string, Readonly<TCachedMeta>>;
  persistCache(
    trunkName: string | undefined,
    cachedBranches: Record<string, TCachedMeta>
  ): void;
  clearPersistedCache(): void;
};
export function composeCacheLoader(splog: TSplog): TCacheLoader {
  const persistedCache = cachePersistenceFactory.load();
  return {
    loadCachedBranches: (trunkName: string | undefined) => {
      splog.debug('Reading cache seed data...');
      const cacheSeed = getCacheSeed(trunkName);
      splog.debug('Loading cache...');
      return (
        (persistedCache.data.sha === hashSeed(cacheSeed) &&
          Object.fromEntries(persistedCache.data.branches)) ||
        parseBranchesAndMeta(
          {
            ...cacheSeed,
            trunkName,
          },
          splog
        )
      );
    },
    persistCache: (
      trunkName: string | undefined,
      cachedBranches: Record<string, TCachedMeta>
    ) => {
      splog.debug(`Persisting cache...`);
      persistedCache.update((data) => {
        data.sha = hashSeed(getCacheSeed(trunkName));
        data.branches = Object.entries(cachedBranches);
      });
    },
    clearPersistedCache: () => {
      splog.debug(`Clearing persisted cache...`);
      persistedCache.delete();
    },
  };
}

function getCacheSeed(trunkName: string | undefined): TCacheSeed {
  return {
    version,
    trunkName,
    rebaseHead: getRebaseHead(),
    gitBranchNamesAndRevisions: getBranchNamesAndRevisions(),
    metadataRefList: getMetadataRefList(),
  };
}

function hashSeed(data: TCacheSeed): string {
  return createHash('sha1')
    .update(JSON.stringify(data))
    .digest('hex')
    .toString();
}
