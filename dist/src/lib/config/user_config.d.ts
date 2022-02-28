export declare const userConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            branchPrefix: string | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
        };
        readonly update: (mutator: (data: {
            branchPrefix: string | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
        }) => void) => void;
        readonly path: string;
    };
};
