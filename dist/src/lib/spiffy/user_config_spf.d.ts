export declare const userConfigFactory: {
    load: (filePath?: string | undefined) => {
        readonly data: {
            authToken?: string | undefined;
            restackCommitterDateIsAuthorDate?: boolean | undefined;
            branchPrefix?: string | undefined;
            branchDate?: boolean | undefined;
            branchReplacement?: "" | "-" | "_" | undefined;
            tips?: boolean | undefined;
            editor?: string | undefined;
        } & {};
        readonly update: (mutator: (data: {
            authToken?: string | undefined;
            restackCommitterDateIsAuthorDate?: boolean | undefined;
            branchPrefix?: string | undefined;
            branchDate?: boolean | undefined;
            branchReplacement?: "" | "-" | "_" | undefined;
            tips?: boolean | undefined;
            editor?: string | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        getEditor: () => string;
    };
    loadIfExists: (filePath?: string | undefined) => ({
        readonly data: {
            authToken?: string | undefined;
            restackCommitterDateIsAuthorDate?: boolean | undefined;
            branchPrefix?: string | undefined;
            branchDate?: boolean | undefined;
            branchReplacement?: "" | "-" | "_" | undefined;
            tips?: boolean | undefined;
            editor?: string | undefined;
        } & {};
        readonly update: (mutator: (data: {
            authToken?: string | undefined;
            restackCommitterDateIsAuthorDate?: boolean | undefined;
            branchPrefix?: string | undefined;
            branchDate?: boolean | undefined;
            branchReplacement?: "" | "-" | "_" | undefined;
            tips?: boolean | undefined;
            editor?: string | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        getEditor: () => string;
    }) | undefined;
};
export declare type TUserConfig = ReturnType<typeof userConfigFactory.load>;
