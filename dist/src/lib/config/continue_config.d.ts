export declare const continueConfigFactory: {
    load: (configPath?: string | undefined) => {
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
    loadIfExists: (configPath?: string | undefined) => {
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
