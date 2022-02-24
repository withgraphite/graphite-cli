import { MergeConflictCallstackT, TStackFixActionStackFrame } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context/context';
import Branch from '../wrapper-classes/branch';
export declare function fixAction(opts: {
    action: 'regen' | 'rebase' | undefined;
    mergeConflictCallstack: MergeConflictCallstackT;
}, context: TContext): Promise<void>;
export declare function stackFixActionContinuation(frame: TStackFixActionStackFrame): Promise<void>;
export declare function restackBranch(args: {
    branch: Branch;
    mergeConflictCallstack: MergeConflictCallstackT;
}, context: TContext): Promise<void>;
