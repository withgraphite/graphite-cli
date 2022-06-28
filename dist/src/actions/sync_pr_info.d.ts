import { TPRInfoToUpsert } from '../lib/api/pr_info';
import { TContext } from '../lib/context';
import { TMetaCache } from '../lib/engine/cache';
export declare function syncPrInfo(branchNames: string[], context: TContext): Promise<void>;
export declare function upsertPrInfoForBranches(prInfoToUpsert: TPRInfoToUpsert, metaCache: TMetaCache): void;
