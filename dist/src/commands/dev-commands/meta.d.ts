import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly hidden: true;
    };
    readonly edit: {
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "e";
    };
};
export declare const command = "meta <branch>";
export declare const canonical = "dev meta";
export declare const description = false;
export declare const builder: {
    readonly branch: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly hidden: true;
    };
    readonly edit: {
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "e";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
