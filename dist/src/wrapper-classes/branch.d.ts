import { TContext } from './../lib/context/context';
import { TBranchPRInfo, TBranchPriorSubmitInfo } from './metadata_ref';
declare type TBranchFilters = {
    useMemoizedResults?: boolean;
    maxDaysBehindTrunk?: number;
    maxBranches?: number;
    sort?: '-committerdate';
};
export declare class Branch {
    name: string;
    shouldUseMemoizedResults: boolean;
    static create(branchName: string, parentBranchName: string, parentBranchRevision: string): void;
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
    stackByTracingMetaParents(context: TContext, branch?: Branch): string[];
    stackByTracingGitParents(context: TContext, branch?: Branch): string[];
    getParentFromMeta(context: TContext): Branch | undefined;
    private static calculateMemoizedMetaChildren;
    getChildrenFromMeta(context: TContext): Branch[];
    isUpstreamOf(commitRef: string, context: TContext): boolean;
    ref(context: TContext): string;
    getMetaMergeBase(context: TContext): string | undefined;
    static exists(branchName: string): boolean;
    static existsOnRemote(branchName: string, remote: string): boolean;
    static metaExistsOnRemote(branchName: string, remote: string): boolean;
    static getParentFromRemote(branchName: string, remote: string): string | undefined;
    static copyFromRemote(branchName: string, remote: string): void;
    private getMeta;
    private writeMeta;
    getMetaPrevRef(): string | undefined;
    getCurrentRef(): string;
    clearMetadata(): this;
    clearParentMetadata(): void;
    getParentBranchSha(): string | undefined;
    getParentBranchName(): string | undefined;
    setParentBranchName(parentBranchName: string): void;
    setParentBranch(parent: Branch): void;
    savePrevRef(): void;
    lastCommitTime(): number;
    isTrunk(context: TContext): boolean;
    static branchWithName(name: string, context: TContext): Branch;
    static getCurrentBranch(): Branch | null;
    private static allBranchesImpl;
    static allBranches(context: TContext, opts?: TBranchFilters): Branch[];
    static allBranchesWithFilter(args: {
        filter: (branch: Branch) => boolean;
        opts?: TBranchFilters;
    }, context: TContext): Branch[];
    static getAllBranchesWithoutParents(context: TContext, opts?: TBranchFilters & {
        excludeTrunk?: boolean;
    }): Promise<Branch[]>;
    static getAllBranchesWithParents(context: TContext, opts?: TBranchFilters): Promise<Branch[]>;
    getChildrenFromGit(context: TContext): Branch[];
    private sortBranchesAlphabetically;
    getParentsFromGit(context: TContext): Branch[];
    private pointsToSameCommitAs;
    branchesWithSameCommit(context: TContext): Branch[];
    upsertPriorSubmitInfo(priorSubmitInfo: TBranchPriorSubmitInfo): void;
    getPriorSubmitTitle(): string | undefined;
    getPriorReviewers(): string[] | undefined;
    getPriorSubmitBody(): string | undefined;
    upsertPRInfo(prInfo: TBranchPRInfo): void;
    clearPRInfo(): void;
    getPRInfo(): TBranchPRInfo | undefined;
    isBaseSameAsRemotePr(context: TContext): boolean;
    getCommitSHAs(context: TContext): string[];
}
export {};
