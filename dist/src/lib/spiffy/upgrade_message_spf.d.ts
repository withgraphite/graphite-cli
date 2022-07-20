export declare const messageConfigFactory: {
    load: (filePath?: string | undefined) => {
        readonly data: {
            message?: ({} & {
                contents: string;
                cliVersion: string;
            }) | undefined;
        } & {};
        readonly update: (mutator: (data: {
            message?: ({} & {
                contents: string;
                cliVersion: string;
            }) | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (filePath?: string | undefined) => {
        readonly data: {
            message?: ({} & {
                contents: string;
                cliVersion: string;
            }) | undefined;
        } & {};
        readonly update: (mutator: (data: {
            message?: ({} & {
                contents: string;
                cliVersion: string;
            }) | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
export declare type TMessageConfig = ReturnType<typeof messageConfigFactory.load>;
