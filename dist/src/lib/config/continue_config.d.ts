export declare const continueConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            branchesToSync: string[];
            branchesToRestack: string[];
            currentBranchOverride: string | undefined;
        };
        readonly update: (mutator: (data: {
            branchesToSync: string[];
            branchesToRestack: string[];
            currentBranchOverride: string | undefined;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (configPath?: string | undefined) => {
        readonly data: {
            branchesToSync: string[];
            branchesToRestack: string[];
            currentBranchOverride: string | undefined;
        };
        readonly update: (mutator: (data: {
            branchesToSync: string[];
            branchesToRestack: string[];
            currentBranchOverride: string | undefined;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
export declare type TContinueConfig = ReturnType<typeof continueConfigFactory.load>;
