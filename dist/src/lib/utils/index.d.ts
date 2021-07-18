declare type UserConfigT = {
    branchPrefix?: string;
};
declare type RepoConfigT = {
    trunkBranches?: string[];
};
export declare const CURRENT_REPO_CONFIG_PATH: string | undefined;
export declare function makeId(length: number): string;
export declare let userConfig: UserConfigT;
export declare let repoConfig: RepoConfigT;
export declare const trunkBranches: string[] | undefined;
export {};
