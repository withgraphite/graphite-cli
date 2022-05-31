export declare type TBranchPRState = 'OPEN' | 'CLOSED' | 'MERGED';
export declare type TBranchPRReviewDecision = 'APPROVED' | 'REVIEW_REQUIRED' | 'CHANGES_REQUESTED';
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
    prevRef?: string;
    prInfo?: TBranchPRInfo;
};
export declare class MetadataRef {
    _branchName: string;
    constructor(branchName: string);
    private static branchMetadataDirPath;
    private static pathForBranchName;
    static getMeta(branchName: string, opts?: {
        dir: string;
    }): TMeta | undefined;
    static updateOrCreate(branchName: string, meta: TMeta, opts?: {
        dir: string;
    }): void;
    getPath(): string;
    rename(newBranchName: string): void;
    read(opts?: {
        dir: string;
    }): TMeta | undefined;
    private static readImpl;
    delete(): void;
    static allMetadataRefs(): MetadataRef[];
}
