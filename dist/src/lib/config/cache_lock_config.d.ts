export declare const cacheLockConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            timestamp?: number | undefined;
            pid?: number | undefined;
        } & {};
        readonly update: (mutator: (data: {
            timestamp?: number | undefined;
            pid?: number | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    };
    loadIfExists: (configPath?: string | undefined) => {
        readonly data: {
            timestamp?: number | undefined;
            pid?: number | undefined;
        } & {};
        readonly update: (mutator: (data: {
            timestamp?: number | undefined;
            pid?: number | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    } | undefined;
};
