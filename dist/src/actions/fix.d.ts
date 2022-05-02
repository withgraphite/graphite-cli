import { TMergeConflictCallstack, TStackFixActionStackFrame } from '../lib/config/merge_conflict_callstack_config';
import { TContext } from '../lib/context/context';
import { Branch } from '../wrapper-classes/branch';
export declare function rebaseUpstack(context: TContext): Promise<void>;
declare type TFixScope = 'stack' | 'upstack';
export declare function fixAction(opts: {
    action: 'regen' | 'rebase' | undefined;
    mergeConflictCallstack: TMergeConflictCallstack;
    scope: TFixScope;
}, context: TContext): Promise<void>;
export declare function stackFixActionContinuation(frame: TStackFixActionStackFrame): void;
export declare function restackBranch(args: {
    branch: Branch;
    mergeConflictCallstack: TMergeConflictCallstack;
}, context: TContext): void;
export {};
