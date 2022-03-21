import * as t from '@withgraphite/retype';
import { TContext } from './../context/context';
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
declare const StackEditStackFrameSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    op: "STACK_EDIT_CONTINUATION";
    currentBranchName: string;
    remainingEdits: {
        type: "pick";
        branchName: string;
        onto: string;
    }[];
};
declare const StackOntoBaseRebaseStackFrameSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    op: "STACK_ONTO_BASE_REBASE_CONTINUATION";
    currentBranchName: string;
    onto: string;
};
declare const StackOntoFixStackFrameSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    op: "STACK_ONTO_FIX_CONTINUATION";
    currentBranchName: string;
    onto: string;
};
declare const StackFixActionStackFrameSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    op: "STACK_FIX_ACTION_CONTINUATION";
    checkoutBranchName: string;
};
declare const RestackNodeStackFrameSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    op: "STACK_FIX";
    sourceBranchName: string;
};
declare const DeleteBranchesStackFrameSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    op: "DELETE_BRANCHES_CONTINUATION";
    force: boolean;
    showDeleteProgress: boolean;
};
declare const RepoFixBranchCountSanityCheckStackFrameSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    op: "REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION";
};
declare const RepoSyncStackFrameSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    op: "REPO_SYNC_CONTINUATION";
    force: boolean;
    resubmit: boolean;
    oldBranchName: string;
};
export declare type TStackEditStackFrame = t.TypeOf<typeof StackEditStackFrameSchema>;
export declare type TStackOntoBaseRebaseStackFrame = t.TypeOf<typeof StackOntoBaseRebaseStackFrameSchema>;
export declare type TStackOntoFixStackFrame = t.TypeOf<typeof StackOntoFixStackFrameSchema>;
export declare type TStackFixActionStackFrame = t.TypeOf<typeof StackFixActionStackFrameSchema>;
export declare type TRestackNodeStackFrame = t.TypeOf<typeof RestackNodeStackFrameSchema>;
export declare type TDeleteBranchesStackFrame = t.TypeOf<typeof DeleteBranchesStackFrameSchema>;
export declare type TRepoFixBranchCountSanityCheckStackFrame = t.TypeOf<typeof RepoFixBranchCountSanityCheckStackFrameSchema>;
export declare type TRepoSyncStackFrame = t.TypeOf<typeof RepoSyncStackFrameSchema>;
declare const MergeConflictCallstackSchema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    callstack: ({
        op: "STACK_EDIT_CONTINUATION";
        currentBranchName: string;
        remainingEdits: {
            type: "pick";
            branchName: string;
            onto: string;
        }[];
    } | {
        op: "STACK_ONTO_BASE_REBASE_CONTINUATION";
        currentBranchName: string;
        onto: string;
    } | {
        op: "STACK_ONTO_FIX_CONTINUATION";
        currentBranchName: string;
        onto: string;
    } | {
        op: "STACK_FIX_ACTION_CONTINUATION";
        checkoutBranchName: string;
    } | {
        op: "STACK_FIX";
        sourceBranchName: string;
    } | {
        op: "DELETE_BRANCHES_CONTINUATION";
        force: boolean;
        showDeleteProgress: boolean;
    } | {
        op: "REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION";
    } | {
        op: "REPO_SYNC_CONTINUATION";
        force: boolean;
        resubmit: boolean;
        oldBranchName: string;
    })[];
};
export declare type TMergeConflictCallstack = t.TypeOf<typeof MergeConflictCallstackSchema>['callstack'];
export declare const mergeConflictCallstackConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            callstack: ({
                op: "STACK_EDIT_CONTINUATION";
                currentBranchName: string;
                remainingEdits: {
                    type: "pick";
                    branchName: string;
                    onto: string;
                }[];
            } | {
                op: "STACK_ONTO_BASE_REBASE_CONTINUATION";
                currentBranchName: string;
                onto: string;
            } | {
                op: "STACK_ONTO_FIX_CONTINUATION";
                currentBranchName: string;
                onto: string;
            } | {
                op: "STACK_FIX_ACTION_CONTINUATION";
                checkoutBranchName: string;
            } | {
                op: "STACK_FIX";
                sourceBranchName: string;
            } | {
                op: "DELETE_BRANCHES_CONTINUATION";
                force: boolean;
                showDeleteProgress: boolean;
            } | {
                op: "REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION";
            } | {
                op: "REPO_SYNC_CONTINUATION";
                force: boolean;
                resubmit: boolean;
                oldBranchName: string;
            })[];
        };
        readonly update: (mutator: (data: {
            callstack: ({
                op: "STACK_EDIT_CONTINUATION";
                currentBranchName: string;
                remainingEdits: {
                    type: "pick";
                    branchName: string;
                    onto: string;
                }[];
            } | {
                op: "STACK_ONTO_BASE_REBASE_CONTINUATION";
                currentBranchName: string;
                onto: string;
            } | {
                op: "STACK_ONTO_FIX_CONTINUATION";
                currentBranchName: string;
                onto: string;
            } | {
                op: "STACK_FIX_ACTION_CONTINUATION";
                checkoutBranchName: string;
            } | {
                op: "STACK_FIX";
                sourceBranchName: string;
            } | {
                op: "DELETE_BRANCHES_CONTINUATION";
                force: boolean;
                showDeleteProgress: boolean;
            } | {
                op: "REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION";
            } | {
                op: "REPO_SYNC_CONTINUATION";
                force: boolean;
                resubmit: boolean;
                oldBranchName: string;
            })[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (configPath?: string | undefined) => {
        readonly data: {
            callstack: ({
                op: "STACK_EDIT_CONTINUATION";
                currentBranchName: string;
                remainingEdits: {
                    type: "pick";
                    branchName: string;
                    onto: string;
                }[];
            } | {
                op: "STACK_ONTO_BASE_REBASE_CONTINUATION";
                currentBranchName: string;
                onto: string;
            } | {
                op: "STACK_ONTO_FIX_CONTINUATION";
                currentBranchName: string;
                onto: string;
            } | {
                op: "STACK_FIX_ACTION_CONTINUATION";
                checkoutBranchName: string;
            } | {
                op: "STACK_FIX";
                sourceBranchName: string;
            } | {
                op: "DELETE_BRANCHES_CONTINUATION";
                force: boolean;
                showDeleteProgress: boolean;
            } | {
                op: "REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION";
            } | {
                op: "REPO_SYNC_CONTINUATION";
                force: boolean;
                resubmit: boolean;
                oldBranchName: string;
            })[];
        };
        readonly update: (mutator: (data: {
            callstack: ({
                op: "STACK_EDIT_CONTINUATION";
                currentBranchName: string;
                remainingEdits: {
                    type: "pick";
                    branchName: string;
                    onto: string;
                }[];
            } | {
                op: "STACK_ONTO_BASE_REBASE_CONTINUATION";
                currentBranchName: string;
                onto: string;
            } | {
                op: "STACK_ONTO_FIX_CONTINUATION";
                currentBranchName: string;
                onto: string;
            } | {
                op: "STACK_FIX_ACTION_CONTINUATION";
                checkoutBranchName: string;
            } | {
                op: "STACK_FIX";
                sourceBranchName: string;
            } | {
                op: "DELETE_BRANCHES_CONTINUATION";
                force: boolean;
                showDeleteProgress: boolean;
            } | {
                op: "REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION";
            } | {
                op: "REPO_SYNC_CONTINUATION";
                force: boolean;
                resubmit: boolean;
                oldBranchName: string;
            })[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
export declare function persistMergeConflictCallstack(callstack: TMergeConflictCallstack, context: TContext): void;
export {};
