import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
declare type TCacheLoader = {
    loadCachedBranches(trunkName: string | undefined): Record<string, Readonly<TCachedMeta>>;
    persistCache(trunkName: string | undefined, cachedBranches: Record<string, TCachedMeta>): void;
    clearPersistedCache(): void;
};
export declare function composeCacheLoader(splog: TSplog): TCacheLoader;
export {};
