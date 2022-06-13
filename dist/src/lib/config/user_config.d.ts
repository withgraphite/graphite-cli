export declare const userConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            branchPrefix: string | undefined;
            branchDate: boolean | undefined;
            branchReplacement: "" | "-" | "_" | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
        };
        readonly update: (mutator: (data: {
            branchPrefix: string | undefined;
            branchDate: boolean | undefined;
            branchReplacement: "" | "-" | "_" | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        getEditor: () => string;
    };
    loadIfExists: (configPath?: string | undefined) => ({
        readonly data: {
            branchPrefix: string | undefined;
            branchDate: boolean | undefined;
            branchReplacement: "" | "-" | "_" | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
        };
        readonly update: (mutator: (data: {
            branchPrefix: string | undefined;
            branchDate: boolean | undefined;
            branchReplacement: "" | "-" | "_" | undefined;
            authToken: string | undefined;
            tips: boolean | undefined;
            editor: string | undefined;
        }) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        getEditor: () => string;
    }) | undefined;
};
export declare type TUserConfig = ReturnType<typeof userConfigFactory.load>;
