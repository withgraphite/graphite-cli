import { TRepoSyncStackFrame } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context/context';
export declare function syncAction(opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    resubmit: boolean;
    fixDanglingBranches: boolean;
}, context: TContext): Promise<void>;
export declare function repoSyncDeleteMergedBranchesContinuation(frame: TRepoSyncStackFrame, context: TContext): Promise<void>;
