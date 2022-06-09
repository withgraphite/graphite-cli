export declare const repoConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            owner: string | undefined;
            name: string | undefined;
            trunk: string | undefined;
            remote: string | undefined;
            lastFetchedPRInfoMs: number | undefined;
        };
        readonly update: (mutator: (data: {
            owner: string | undefined;
            name: string | undefined;
            trunk: string | undefined;
            remote: string | undefined;
            lastFetchedPRInfoMs: number | undefined;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        readonly setRemote: (remote: string) => void;
        readonly getRemote: () => string;
        readonly setTrunk: (trunk: string) => void;
        readonly graphiteInitialized: () => boolean;
        readonly getRepoOwner: () => string;
        readonly getRepoName: () => string;
    };
    loadIfExists: (configPath?: string | undefined) => ({
        readonly data: {
            owner: string | undefined;
            name: string | undefined;
            trunk: string | undefined;
            remote: string | undefined;
            lastFetchedPRInfoMs: number | undefined;
        };
        readonly update: (mutator: (data: {
            owner: string | undefined;
            name: string | undefined;
            trunk: string | undefined;
            remote: string | undefined;
            lastFetchedPRInfoMs: number | undefined;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        readonly setRemote: (remote: string) => void;
        readonly getRemote: () => string;
        readonly setTrunk: (trunk: string) => void;
        readonly graphiteInitialized: () => boolean;
        readonly getRepoOwner: () => string;
        readonly getRepoName: () => string;
    }) | undefined;
};
export declare function getOwnerAndNameFromURL(originURL: string): {
    owner: string | undefined;
    name: string | undefined;
};
export declare type TRepoConfig = ReturnType<typeof repoConfigFactory.load>;
