import { MergeConflictCallstackT } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
export declare function currentBranchOntoAction(args: {
    onto: string;
    mergeConflictCallstack: MergeConflictCallstackT;
}, context: TContext): Promise<void>;
