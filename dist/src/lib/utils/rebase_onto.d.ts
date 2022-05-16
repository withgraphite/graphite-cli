import { Branch } from '../../wrapper-classes/branch';
import { TMergeConflictCallstack } from '../config/merge_conflict_callstack_config';
import { TContext } from '../context';
export declare function rebaseOnto(args: {
    onto: Branch;
    mergeBase: string;
    branch: Branch;
    mergeConflictCallstack: TMergeConflictCallstack;
}, context: TContext): boolean;
