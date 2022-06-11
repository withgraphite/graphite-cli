import { getSha } from '../git/get_sha';
import { getBranchNamesAndRevisions } from '../git/sorted_branch_names';
import { gpExecSync } from '../utils/exec_sync';
import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import { getMetadataRefList } from './metadata_ref';
import { parseBranchesAndMeta } from './parse_branches_and_meta';

const CACHE_CHECK_REF = 'refs/gt-metadata/GRAPHITE_CACHE_CHECK';
const CACHE_DATA_REF = 'refs/gt-metadata/GRAPHITE_CACHE_DATA';

export function loadCachedBranches(
  args: { trunkName: string | undefined; ignorePersistedCache?: boolean },
  splog: TSplog
): Record<string, Readonly<TCachedMeta>> {
  splog.debug('Reading cache seed data...');
  const cacheKey = {
    trunkName: args.trunkName,
    gitBranchNamesAndRevisions: getBranchNamesAndRevisions(),
    metadataRefList: getMetadataRefList(),
  };

  splog.debug('Loading cache...');
  return (
    (!args.ignorePersistedCache &&
      getSha(CACHE_CHECK_REF) === hashCacheOrKey(cacheKey) &&
      readPersistedCache()) ||
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

type TCacheKey = {
  trunkName: string | undefined;
  gitBranchNamesAndRevisions: Record<string, string>;
  metadataRefList: Record<string, string>;
};

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

function hashCacheOrKey(
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
