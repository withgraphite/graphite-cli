#!/usr/bin/env node
import Branch from '../../wrapper-classes/branch';
/**
 * TODO (nicholasyan): for now, this just syncs info for branches with existing
 * PR info. In the future, we can extend this method to query GitHub for PRs
 * associated with branch heads that don't have associated PR info.
 */
export declare function syncPRInfoForBranches(branches: Branch[]): Promise<void>;
