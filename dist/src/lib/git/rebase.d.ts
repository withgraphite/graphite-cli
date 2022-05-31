import { Branch } from '../../wrapper-classes/branch';
import { TMergeConflictCallstack } from '../config/merge_conflict_callstack_config';
import { TContext } from '../context';
export declare function rebaseOnto(args: {
    onto: Branch;
    mergeBase: string;
    branch: Branch;
    mergeConflictCallstack: TMergeConflictCallstack;
}, context: TContext): boolean;
export declare function rebaseInteractive(args: {
    base: string;
    currentBranchName: string;
}, context: TContext): void;
