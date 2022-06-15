export declare const messageConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            message?: ({} & {
                cliVersion: string;
                contents: string;
            }) | undefined;
        } & {};
        readonly update: (mutator: (data: {
            message?: ({} & {
                cliVersion: string;
                contents: string;
            }) | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (configPath?: string | undefined) => {
        readonly data: {
            message?: ({} & {
                cliVersion: string;
                contents: string;
            }) | undefined;
        } & {};
        readonly update: (mutator: (data: {
            message?: ({} & {
                cliVersion: string;
                contents: string;
            }) | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
export declare type TMessageConfig = ReturnType<typeof messageConfigFactory.load>;
