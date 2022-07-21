export declare function getCurrentBranchName(): string | undefined;
export declare function branchMove(newName: string): void;
export declare function deleteBranch(branchName: string): void;
export declare function switchBranch(branch: string, opts?: {
    new?: boolean;
    detach?: boolean;
    force?: boolean;
}): void;
export declare function forceCheckoutNewBranch(branchName: string, sha: string): void;
export declare function forceCreateBranch(branchName: string, sha: string): void;
