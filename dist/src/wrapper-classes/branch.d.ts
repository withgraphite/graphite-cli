import Commit from './commit';
import { TBranchPRInfo } from './metadata_ref';
declare type TBranchFilters = {
    useMemoizedResults?: boolean;
    maxDaysBehindTrunk?: number;
    maxBranches?: number;
    sort?: '-committerdate';
};
export default class Branch {
    name: string;
    shouldUseMemoizedResults: boolean;
    constructor(name: string, opts?: {
        useMemoizedResults: boolean;
    });
    /**
     * Uses memoized results for some of the branch calculations. Only turn this
     * on if the git tree should not change at all during the current invoked
     * command.
     */
    useMemoizedResults(): Branch;
    toString(): string;
    stackByTracingMetaParents(branch?: Branch): string[];
    stackByTracingGitParents(branch?: Branch): string[];
    getParentFromMeta(): Branch | undefined;
    getChildrenFromMeta(): Branch[];
    isUpstreamOf(commitRef: string): boolean;
    ref(): string;
    getMetaMergeBase(): string | undefined;
    static exists(branchName: string): boolean;
    private getMeta;
    private writeMeta;
    getMetaPrevRef(): string | undefined;
    getCurrentRef(): string;
    clearMetadata(): this;
    clearParentMetadata(): void;
    setParentBranchName(parentBranchName: string): void;
    resetParentBranch(): void;
    setMetaPrevRef(prevRef: string): void;
    lastCommitTime(): number;
    isTrunk(): boolean;
    static branchWithName(name: string): Promise<Branch>;
    static getCurrentBranch(): Branch | null;
    private static allBranchesImpl;
    static allBranches(opts?: TBranchFilters): Branch[];
    static allBranchesWithFilter(args: {
        filter: (branch: Branch) => boolean;
        opts?: TBranchFilters;
    }): Branch[];
    static getAllBranchesWithoutParents(opts?: TBranchFilters & {
        excludeTrunk?: boolean;
    }): Promise<Branch[]>;
    static getAllBranchesWithParents(opts?: TBranchFilters): Promise<Branch[]>;
    head(): Commit;
    base(): Commit | undefined;
    getChildrenFromGit(): Branch[];
    private sortBranchesAlphabetically;
    getParentsFromGit(): Branch[];
    private pointsToSameCommitAs;
    branchesWithSameCommit(): Branch[];
    setPriorSubmitTitle(title: string): void;
    getPriorSubmitTitle(): string | undefined;
    setPriorReviewers(reviewers: string[] | undefined): void;
    getPriorReviewers(): string[] | undefined;
    setPriorSubmitBody(body: string): void;
    getPriorSubmitBody(): string | undefined;
    setPRInfo(prInfo: TBranchPRInfo): void;
    clearPRInfo(): void;
    getPRInfo(): TBranchPRInfo | undefined;
    isBaseSameAsRemotePr(): boolean;
    getNonEmptyCommitSHAs(): string[];
}
export {};
