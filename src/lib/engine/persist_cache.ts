import { getBranchNamesAndRevisions } from '../git/sorted_branch_names';
import { gpExecSync } from '../utils/exec_sync';
import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import { CACHE_CHECK_REF, CACHE_DATA_REF, TCacheKey } from './cache_loader';
import { getMetadataRefList } from './metadata_ref';

export function persistCache(
  trunkName: string | undefined,
  cachedBranches: Record<string, TCachedMeta>,
  splog: TSplog
): void {
  splog.debug(`Persisting cache checksum to ${CACHE_CHECK_REF}...`);
  gpExecSync(
    {
      command: `git update-ref ${CACHE_CHECK_REF} ${hashCacheOrKey(
        {
          trunkName: trunkName,
          gitBranchNamesAndRevisions: getBranchNamesAndRevisions(),
          metadataRefList: getMetadataRefList(),
        },
        true
      )}`,
    },
    (err) => {
      throw err;
    }
  );
  splog.debug(`Persisting cache data to ${CACHE_DATA_REF}...`);
  gpExecSync({
    command: `git update-ref ${CACHE_DATA_REF} ${hashCacheOrKey(
      cachedBranches,
      true
    )}`,
  });
  splog.debug(`Persisted cache`);
}

export function hashCacheOrKey(
  state: TCacheKey | Record<string, TCachedMeta>,
  write?: boolean
): string {
  return gpExecSync(
    {
      command: `git hash-object ${write ? '-w' : ''} --stdin`,
      options: {
        input: JSON.stringify(state),
      },
    },
    (err) => {
      throw err;
    }
  );
}

export function clearPersistedCache(splog: TSplog): void {
  splog.debug(`Deleting ${CACHE_CHECK_REF}...`);
  gpExecSync({ command: `git update-ref -d ${CACHE_CHECK_REF}` });
  splog.debug(`Deleting ${CACHE_DATA_REF}...`);
  gpExecSync({ command: `git update-ref -d ${CACHE_DATA_REF}` });
  splog.debug(`Cleared cache`);
}
