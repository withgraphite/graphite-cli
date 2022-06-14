declare type TBranchPRState = 'OPEN' | 'CLOSED' | 'MERGED';
declare type TBranchPRReviewDecision = 'APPROVED' | 'REVIEW_REQUIRED' | 'CHANGES_REQUESTED';
export declare type TBranchPRInfo = {
    number?: number;
    base?: string;
    url?: string;
    title?: string;
    body?: string;
    state?: TBranchPRState;
    reviewDecision?: TBranchPRReviewDecision;
    isDraft?: boolean;
};
export declare type TMeta = {
    parentBranchName?: string;
    parentBranchRevision?: string;
    prInfo?: TBranchPRInfo;
};
export declare function writeMetadataRef(branchName: string, meta: TMeta, cwd?: string): void;
export declare function readMetadataRef(branchName: string, cwd?: string): TMeta;
export declare function deleteMetadataRef(branchName: string): void;
export declare function getMetadataRefList(): Record<string, string>;
export {};
