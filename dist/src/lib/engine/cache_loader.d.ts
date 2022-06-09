import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
export declare const CACHE_CHECK_REF = "refs/gt-metadata/GRAPHITE_CACHE_CHECK";
export declare const CACHE_DATA_REF = "refs/gt-metadata/GRAPHITE_CACHE_DATA";
export declare function loadCachedBranches(args: {
    trunkName: string | undefined;
    ignorePersistedCache?: boolean;
}, splog: TSplog): Record<string, Readonly<TCachedMeta>>;
export declare type TCacheKey = {
    trunkName: string | undefined;
    gitBranchNamesAndRevisions: Record<string, string>;
    metadataRefList: Record<string, string>;
};
