import Commit from "./commit";
export declare const MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV = 50;
export default class Branch {
    name: string;
    constructor(name: string);
    toString(): string;
    private getMeta;
    private writeMeta;
    stackByTracingMetaParents(branch?: Branch): string[];
    stackByTracingGitParents(branch?: Branch): string[];
    getParentFromMeta(): Branch | undefined;
    static allBranches(): Branch[];
    getChildrenFromMeta(): Promise<Branch[]>;
    getMetaMergeBase(): string | undefined;
    getMetaPrevRef(): string | undefined;
    getCurrentRef(): string;
    setParentBranchName(parentBranchName: string): void;
    setMetaPrevRef(prevRef: string): void;
    getTrunkBranchFromGit(): Branch;
    static branchWithName(name: string): Promise<Branch>;
    static getCurrentBranch(): Branch | null;
    static getAllBranchesWithoutParents(): Promise<Branch[]>;
    static getAllBranchesWithParents(): Promise<Branch[]>;
    head(): Commit;
    base(): Commit | undefined;
    getChildrenFromGit(): Branch[];
    getParentsFromGit(): Branch[];
    private getChildrenOrParents;
}
