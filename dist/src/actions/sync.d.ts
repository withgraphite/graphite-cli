import { RepoSyncStackFrameT } from "../lib/config/merge_conflict_callstack_config";
export declare function syncAction(opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    resubmit: boolean;
    fixDanglingBranches: boolean;
}): Promise<void>;
export declare function repoSyncDeleteMergedBranchesContinuation(frame: RepoSyncStackFrameT): Promise<void>;
