import { MergeConflictCallstackT, StackFixActionStackframeT } from '../lib/config/merge_conflict_callstack_config';
import Branch from '../wrapper-classes/branch';
export declare function fixAction(opts: {
    action: 'regen' | 'rebase' | undefined;
    mergeConflictCallstack: MergeConflictCallstackT;
}): Promise<void>;
export declare function stackFixActionContinuation(frame: StackFixActionStackframeT): Promise<void>;
export declare function restackBranch(args: {
    branch: Branch;
    mergeConflictCallstack: MergeConflictCallstackT;
}): Promise<void>;
