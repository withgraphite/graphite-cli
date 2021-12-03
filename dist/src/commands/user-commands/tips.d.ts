import yargs from "yargs";
declare const args: {
    readonly enable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Enable tips.";
    };
    readonly disable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Disable tips.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "tips";
export declare const description = "Show tips while using Graphite";
export declare const canonical = "user tips";
export declare const builder: {
    readonly enable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Enable tips.";
    };
    readonly disable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Disable tips.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
