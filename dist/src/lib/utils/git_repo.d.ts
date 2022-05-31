import { TMeta } from '../../wrapper-classes/metadata_ref';
export declare class GitRepo {
    dir: string;
    userConfigPath: string;
    constructor(dir: string, opts?: {
        existingRepo?: boolean;
        repoUrl?: string;
    });
    execCliCommand(command: string, opts?: {
        cwd?: string;
    }): void;
    execGitCommand(command: string, opts?: {
        cwd?: string;
    }): void;
    execCliCommandAndGetOutput(command: string): string;
    createChange(textValue: string, prefix?: string, unstaged?: boolean): void;
    createChangeAndCommit(textValue: string, prefix?: string): void;
    createChangeAndAmend(textValue: string, prefix?: string): void;
    deleteBranch(name: string): void;
    createPrecommitHook(contents: string): void;
    createAndCheckoutBranch(name: string): void;
    checkoutBranch(name: string): void;
    rebaseInProgress(): boolean;
    resolveMergeConflicts(): void;
    markMergeConflictsAsResolved(): void;
    finishInteractiveRebase(opts?: {
        resolveMergeConflicts?: boolean;
    }): void;
    currentBranchName(): string;
    getRef(refName: string): string;
    listCurrentBranchCommitMessages(): string[];
    mergeBranch(args: {
        branch: string;
        mergeIn: string;
    }): void;
    upsertMeta(name: string, partialMeta: Partial<TMeta>): void;
}
