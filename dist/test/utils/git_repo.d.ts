export default class GitRepo {
    dir: string;
    constructor(dir: string);
    createChange(textValue: string, prefix?: string): void;
    createChangeAndCommit(textValue: string, prefix?: string): void;
    createAndCheckoutBranch(name: string): void;
    checkoutBranch(name: string): void;
    rebaseInProgress(): boolean;
    finishInteractiveRebase(): void;
    currentBranchName(): string;
    listCurrentBranchCommitMessages(): string[];
}
