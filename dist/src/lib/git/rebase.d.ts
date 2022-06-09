declare type TRebaseResult = 'REBASE_CONFLICT' | 'REBASE_DONE';
export declare function restack(args: {
    parentBranchName: string;
    parentBranchRevision: string;
    branchName: string;
}): TRebaseResult;
export declare function restackContinue(): TRebaseResult;
export declare function rebaseInteractive(args: {
    parentBranchRevision: string;
    branchName: string;
}): TRebaseResult;
export {};
