import { MergeConflictCallstackT, StackOntoBaseRebaseStackFrameT, StackOntoFixStackFrameT } from '../../lib/config/merge_conflict_callstack_config';
import Branch from '../../wrapper-classes/branch';
export declare function stackOnto(opts: {
    currentBranch: Branch;
    onto: string;
    mergeConflictCallstack: MergeConflictCallstackT;
}): Promise<void>;
export declare function stackOntoBaseRebaseContinuation(frame: StackOntoBaseRebaseStackFrameT, mergeConflictCallstack: MergeConflictCallstackT): Promise<void>;
export declare function stackOntoFixContinuation(frame: StackOntoFixStackFrameT): Promise<void>;
