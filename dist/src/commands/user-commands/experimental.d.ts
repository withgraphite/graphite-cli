import yargs from 'yargs';
declare const args: {
    readonly enable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Enable experimental features.";
    };
    readonly disable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Disable experimental features.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "experimental";
export declare const description = "Enable/disable experimental features";
export declare const canonical = "user experimental";
export declare const builder: {
    readonly enable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Enable experimental features.";
    };
    readonly disable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Disable experimental features.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
