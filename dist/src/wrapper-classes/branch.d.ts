import { TContext } from '../lib/context';
import { TBranchPRInfo } from './metadata_ref';
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
    ref(context: TContext): string;
    getMetaMergeBase(context: TContext): string | undefined;
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
    static branchWithName(name: string): Branch;
    static currentBranch(): Branch | undefined;
    static allBranches(context: TContext, opts?: {
        useMemoizedResults?: boolean;
        maxDaysBehindTrunk?: number;
        maxBranches?: number;
        filter?: (branch: Branch) => boolean;
    }): Branch[];
    getChildrenFromGit(context: TContext): Branch[];
    private sortBranchesAlphabetically;
    getParentsFromGit(context: TContext): Branch[];
    private pointsToSameCommitAs;
    branchesWithSameCommit(context: TContext): Branch[];
    upsertPRInfo(prInfo: TBranchPRInfo): void;
    clearPRInfo(): void;
    getPRInfo(): TBranchPRInfo | undefined;
    isBaseSameAsRemotePr(context: TContext): boolean;
    getCommitSHAs(context: TContext): string[];
}
