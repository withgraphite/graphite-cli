import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
export declare function loadCachedBranches(trunkName: string | undefined, splog: TSplog): Record<string, Readonly<TCachedMeta>>;
export declare function persistCache(trunkName: string | undefined, cachedBranches: Record<string, TCachedMeta>, splog: TSplog): void;
export declare function clearPersistedCache(splog: TSplog): void;
