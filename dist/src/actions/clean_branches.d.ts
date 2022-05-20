import { TDeleteBranchesStackFrame, TMergeConflictCallstack } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context';
/**
 * This method is assumed to be idempotent -- if a merge conflict interrupts
 * execution of this method, we simply restart the method upon running `gt
 * continue`.
 */
export declare function cleanBranches(opts: {
    frame: TDeleteBranchesStackFrame;
    parent: TMergeConflictCallstack;
    showSyncTip?: boolean;
}, context: TContext): Promise<void>;
