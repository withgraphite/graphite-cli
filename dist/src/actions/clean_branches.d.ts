import { DeleteBranchesStackFrameT, MergeConflictCallstackT } from '../lib/config/merge_conflict_callstack_config';
/**
 * This method is assumed to be idempotent -- if a merge conflict interrupts
 * execution of this method, we simply restart the method upon running `gt
 * continue`.
 */
export declare function deleteMergedBranches(opts: {
    frame: DeleteBranchesStackFrameT;
    parent: MergeConflictCallstackT;
}): Promise<void>;
