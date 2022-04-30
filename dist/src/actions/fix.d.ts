import { TMergeConflictCallstack, TStackFixActionStackFrame } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context/context';
import { Branch } from '../wrapper-classes/branch';
declare type TFixScope = 'stack' | 'upstack';
export declare function fixAction(opts: {
    action: 'regen' | 'rebase' | undefined;
    mergeConflictCallstack: TMergeConflictCallstack;
    scope: TFixScope;
}, context: TContext): Promise<void>;
export declare function stackFixActionContinuation(frame: TStackFixActionStackFrame): Promise<void>;
export declare function restackBranch(args: {
    branch: Branch;
    mergeConflictCallstack: TMergeConflictCallstack;
}, context: TContext): Promise<void>;
export {};
