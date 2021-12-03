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
    frame: GraphiteFrameT;
    parent: MergeConflictCallstackT;
} | "TOP_OF_CALLSTACK_WITH_NOTHING_AFTER";
declare type GraphiteFrameT = StackOntoBaseRebaseStackFrameT | StackOntoFixStackFrameT | StackFixActionStackframeT | RestackNodeStackFrameT | DeleteBranchesStackFrameT | RepoFixBranchCountSanityCheckStackFrameT | RepoSyncStackFrameT;
export declare type StackOntoBaseRebaseStackFrameT = {
    op: "STACK_ONTO_BASE_REBASE_CONTINUATION";
    currentBranchName: string;
    onto: string;
};
export declare type StackOntoFixStackFrameT = {
    op: "STACK_ONTO_FIX_CONTINUATION";
    currentBranchName: string;
    onto: string;
};
export declare type StackFixActionStackframeT = {
    op: "STACK_FIX_ACTION_CONTINUATION";
    checkoutBranchName: string;
};
export declare type RestackNodeStackFrameT = {
    op: "STACK_FIX";
    sourceBranchName: string;
};
export declare type DeleteBranchesStackFrameT = {
    op: "DELETE_BRANCHES_CONTINUATION";
    force: boolean;
    showDeleteProgress: boolean;
};
export declare type RepoFixBranchCountSanityCheckStackFrameT = {
    op: "REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION";
};
export declare type RepoSyncStackFrameT = {
    op: "REPO_SYNC_CONTINUATION";
    force: boolean;
    resubmit: boolean;
    oldBranchName: string;
};
export declare function persistMergeConflictCallstack(callstack: MergeConflictCallstackT): void;
export declare function getPersistedMergeConflictCallstack(): MergeConflictCallstackT | null;
export declare function clearPersistedMergeConflictCallstack(): void;
export {};
