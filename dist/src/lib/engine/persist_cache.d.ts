import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import { TCacheKey } from './cache_loader';
export declare function persistCache(trunkName: string | undefined, cachedBranches: Record<string, TCachedMeta>, splog: TSplog): void;
export declare function hashCacheOrKey(state: TCacheKey | Record<string, TCachedMeta>, write?: boolean): string;
export declare function clearPersistedCache(splog: TSplog): void;
