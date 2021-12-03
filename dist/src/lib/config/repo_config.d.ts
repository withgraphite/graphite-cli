declare type RepoConfigT = {
    owner?: string;
    name?: string;
    trunk?: string;
    ignoreBranches?: string[];
    logSettings?: {
        maxStacksShownBehindTrunk?: number;
        maxDaysShownBehindTrunk?: number;
    };
    maxStacksShownBehindTrunk?: number;
    maxDaysShownBehindTrunk?: number;
    maxBranchLength?: number;
    lastFetchedPRInfoMs?: number;
};
declare class RepoConfig {
    _data: RepoConfigT;
    graphiteInitialized(): boolean;
    constructor(data: RepoConfigT);
    private save;
    isNotIgnoredBranch(branchName: string): boolean;
    getRepoOwner(): string;
    path(): string;
    setTrunk(trunkName: string): void;
    getTrunk(): string | undefined;
    addIgnoredBranches(ignoreBranchesToAdd: string[]): void;
    setIgnoreBranches(ignoreBranches: string[]): void;
    getIgnoreBranches(): string[];
    setRepoOwner(owner: string): void;
    getRepoName(): string;
    setRepoName(name: string): void;
    getMaxDaysShownBehindTrunk(): number;
    setMaxDaysShownBehindTrunk(n: number): void;
    getMaxStacksShownBehindTrunk(): number;
    setMaxStacksShownBehindTrunk(n: number): void;
    branchIsIgnored(branchName: string): boolean;
    /**
     * These settings used to (briefly) live in logSettings. Moving these to live
     * in the top-level namespace now that they're shared between multiple
     * commands (e.g. log and stacks).
     */
    migrateLogSettings(): void;
    getMaxBranchLength(): number;
    setMaxBranchLength(numCommits: number): void;
    getLastFetchedPRInfoMs(): number | undefined;
    setLastFetchedPRInfoMs(time: number): void;
}
export declare function getOwnerAndNameFromURLForTesting(originURL: string): {
    owner: string | undefined;
    name: string | undefined;
};
declare const repoConfigSingleton: RepoConfig;
export default repoConfigSingleton;
