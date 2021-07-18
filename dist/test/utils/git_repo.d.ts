export default class GitRepo {
    dir: string;
    constructor(dir: string);
    createChange(textValue: string): void;
    createChangeAndCommit(textValue: string): void;
    createAndCheckoutBranch(name: string): void;
    checkoutBranch(name: string): void;
    currentBranchName(): string;
    listCurrentBranchCommitMessages(): string[];
}
