import { TRepoSyncStackFrame } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
declare type TSyncScope = {
    type: 'DOWNSTACK';
    branchName: string;
} | {
    type: 'REPO';
};
export declare function syncAction(opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    resubmit: boolean;
    fixDanglingBranches: boolean;
    pruneRemoteMetadata: boolean;
}, scope: TSyncScope, context: TContext): Promise<void>;
export declare function repoSyncDeleteMergedBranchesContinuation(frame: TRepoSyncStackFrame, context: TContext): Promise<void>;
export {};
/**
 *
 * Remove for now - users are reporting issues where this is incorrectly
 * deleting metadata for still-existing branches.
 *
 * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1632897956089100
 * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1634168133170500
 *
function cleanDanglingMetadata(): void {
  const allMetadataRefs = MetadataRef.allMetadataRefs();
  allMetadataRefs.forEach((ref) => {
    if (!Branch.exists(ref._branchName)) {
      logDebug(`Deleting metadata for ${ref._branchName}`);
      ref.delete();
    }
  });
}
*/
