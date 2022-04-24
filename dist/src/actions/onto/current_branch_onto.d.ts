import { TMergeConflictCallstack } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
export declare function currentBranchOntoAction(args: {
    onto: string;
    mergeConflictCallstack: TMergeConflictCallstack;
}, context: TContext): Promise<void>;
