export declare const continueConfigFactory: {
    load: (filePath?: string | undefined) => {
        readonly data: {
            currentBranchOverride?: string | undefined;
            rebasedBranchBase?: string | undefined;
        } & {
            branchesToSync: string[];
            branchesToRestack: string[];
        };
        readonly update: (mutator: (data: {
            currentBranchOverride?: string | undefined;
            rebasedBranchBase?: string | undefined;
        } & {
            branchesToSync: string[];
            branchesToRestack: string[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (filePath?: string | undefined) => {
        readonly data: {
            currentBranchOverride?: string | undefined;
            rebasedBranchBase?: string | undefined;
        } & {
            branchesToSync: string[];
            branchesToRestack: string[];
        };
        readonly update: (mutator: (data: {
            currentBranchOverride?: string | undefined;
            rebasedBranchBase?: string | undefined;
        } & {
            branchesToSync: string[];
            branchesToRestack: string[];
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
export declare type TContinueConfig = ReturnType<typeof continueConfigFactory.load>;
