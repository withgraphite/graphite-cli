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
    static getMeta(branchName: string): TMeta | undefined;
    static updateOrCreate(branchName: string, meta: TMeta): void;
    static copyMetadataRefFromRemoteTracking(remote: string, branchName: string): void;
    static copyMetadataRefToRemoteTracking(remote: string, branchName: string): void;
    static readRemote(remote: string, branchName: string): TMeta | undefined;
    getPath(): string;
    rename(newBranchName: string): void;
    read(): TMeta | undefined;
    private static readImpl;
    delete(): void;
    static allMetadataRefs(): MetadataRef[];
}
