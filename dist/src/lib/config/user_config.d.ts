export declare const userConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            branchPrefix: string | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
            experimental: boolean | undefined;
        };
        readonly update: (mutator: (data: {
            branchPrefix: string | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
            experimental: boolean | undefined;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (configPath?: string | undefined) => {
        readonly data: {
            branchPrefix: string | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
            experimental: boolean | undefined;
        };
        readonly update: (mutator: (data: {
            branchPrefix: string | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
            experimental: boolean | undefined;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
