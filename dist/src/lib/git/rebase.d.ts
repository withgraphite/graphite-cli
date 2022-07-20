declare type TRebaseResult = 'REBASE_CONFLICT' | 'REBASE_DONE';
export declare function rebase(args: {
    onto: string;
    from: string;
    branchName: string;
    restackCommitterDateIsAuthorDate?: boolean;
}): TRebaseResult;
export declare function rebaseContinue(): TRebaseResult;
export declare function rebaseAbort(): void;
export declare function rebaseInteractive(args: {
    parentBranchRevision: string;
    branchName: string;
}): TRebaseResult;
export {};
