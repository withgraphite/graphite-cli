import { getBranchNamesAndRevisions } from '../git/sorted_branch_names';
import { cuteString } from '../utils/cute_string';
import { gpExecSync } from '../utils/exec_sync';
import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import { CACHE_CHECK_REF, CACHE_DATA_REF } from './cache_loader';
import { getMetadataRefList } from './metadata_ref';

export function persistCache(
  trunkName: string | undefined,
  cachedBranches: Record<string, TCachedMeta>,
  splog: TSplog
): void {
  splog.logDebug(`Persisting cache checksum to ${CACHE_CHECK_REF}...`);
  gpExecSync(
    {
      command: `git update-ref ${CACHE_CHECK_REF} ${hashState(
        cuteString({
          trunkName: trunkName,
          gitBranchNamesAndRevisions: getBranchNamesAndRevisions(),
          metadataRefList: getMetadataRefList(),
        }),
        true
      )}`,
    },
    (err) => {
      throw err;
    }
  );
  splog.logDebug(`Persisting cache data to ${CACHE_DATA_REF}...`);
  gpExecSync({
    command: `git update-ref ${CACHE_DATA_REF} ${hashState(
      cuteString(cachedBranches),
      true
    )}`,
  });
  splog.logDebug(`Persisted cache`);
}

export function hashState(state: string, write?: boolean): string {
  return gpExecSync(
    {
      command: `git hash-object ${write ? '-w' : ''} --stdin`,
      options: {
        input: state,
      },
    },
    (err) => {
      throw err;
    }
  );
}
