import { TStackEdit } from './../../actions/edit/stack_edits';
/**
 * After Graphite is interrupted by a merge conflict, upon continuing, there
 * are 2 main things we need to do.
 *
 * 1) Complete the original rebase operation.
 * 2) Perform any needed follow-up actions that were supposed to occur after
 *    the rebase in the original callstack.
 *
 * The below object helps keep track of these items and persist them across
 * invocations of the CLI.
 */
export declare type MergeConflictCallstackT = {
    frame: TGraphiteFrame;
    parent: MergeConflictCallstackT;
} | 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER';
declare type TGraphiteFrame = TStackOntoBaseRebaseStackFrame | TStackOntoFixStackFrame | TStackFixActionStackFrame | TRestackNodeStackFrame | TDeleteBranchesStackFrame | TRepoFixBranchCountSanityCheckStackFrame | TRepoSyncStackFrame | TStackEditStackFrame;
export declare type TStackEditStackFrame = {
    op: 'STACK_EDIT_CONTINUATION';
    remainingEdits: TStackEdit[];
};
export declare type TStackOntoBaseRebaseStackFrame = {
    op: 'STACK_ONTO_BASE_REBASE_CONTINUATION';
    currentBranchName: string;
    onto: string;
};
export declare type TStackOntoFixStackFrame = {
    op: 'STACK_ONTO_FIX_CONTINUATION';
    currentBranchName: string;
    onto: string;
};
export declare type TStackFixActionStackFrame = {
    op: 'STACK_FIX_ACTION_CONTINUATION';
    checkoutBranchName: string;
};
export declare type TRestackNodeStackFrame = {
    op: 'STACK_FIX';
    sourceBranchName: string;
};
export declare type TDeleteBranchesStackFrame = {
    op: 'DELETE_BRANCHES_CONTINUATION';
    force: boolean;
    showDeleteProgress: boolean;
};
export declare type TRepoFixBranchCountSanityCheckStackFrame = {
    op: 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION';
};
export declare type TRepoSyncStackFrame = {
    op: 'REPO_SYNC_CONTINUATION';
    force: boolean;
    resubmit: boolean;
    oldBranchName: string;
};
export declare function persistMergeConflictCallstack(callstack: MergeConflictCallstackT): void;
export declare function getPersistedMergeConflictCallstack(): MergeConflictCallstackT | null;
export declare function clearPersistedMergeConflictCallstack(): void;
export {};
