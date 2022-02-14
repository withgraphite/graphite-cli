import { MergeConflictCallstackT } from '../../lib/config/merge_conflict_callstack_config';
export declare function currentBranchOntoAction(args: {
    onto: string;
    mergeConflictCallstack: MergeConflictCallstackT;
}): Promise<void>;
