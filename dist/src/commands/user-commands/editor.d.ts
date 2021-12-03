import yargs from "yargs";
declare const args: {
    readonly set: {
        readonly demandOption: false;
        readonly default: "";
        readonly type: "string";
        readonly describe: "Set default editor for Graphite";
    };
    readonly unset: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Unset default editor for Graphite";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const DEFAULT_GRAPHITE_EDITOR = "nano";
export declare const command = "editor";
export declare const description = "Editor used when using Graphite";
export declare const canonical = "user editor";
export declare const builder: {
    readonly set: {
        readonly demandOption: false;
        readonly default: "";
        readonly type: "string";
        readonly describe: "Set default editor for Graphite";
    };
    readonly unset: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Unset default editor for Graphite";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
