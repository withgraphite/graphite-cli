import Branch from "../../wrapper-classes/branch";
export declare function getBranchToRefMapping(): Record<string, string>;
export declare function getRef(branch: Branch): string;
export declare function otherBranchesWithSameCommit(branch: Branch): Branch[];
