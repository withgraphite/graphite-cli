declare type branchRefsT = {
    branchToRef: Record<string, string>;
    refToBranches: Record<string, string[]>;
};
declare type revListT = Record<string, string[]>;
declare class Cache {
    getRepoRootPath(): string | undefined;
    getBranchToRef(): Record<string, string> | undefined;
    getRefToBranches(): Record<string, string[]> | undefined;
    getParentsRevList(): Record<string, string[]> | undefined;
    getChildrenRevList(): Record<string, string[]> | undefined;
    clearAll(): void;
    clearBranchRefs(): void;
    setParentsRevList(newRevList: revListT): void;
    setChildrenRevList(newRevList: revListT): void;
    setBranchRefs(newBranchRefs: branchRefsT): void;
    setRepoRootPath(newRepoRootPath: string): void;
}
export declare const cache: Cache;
export {};
