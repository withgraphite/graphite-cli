import yargs from 'yargs';
export declare const command = "cache";
export declare const canonical = "dev cache";
export declare const description = false;
declare const args: {
    readonly clear: {
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "c";
    };
};
export declare const builder: {
    readonly clear: {
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "c";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
