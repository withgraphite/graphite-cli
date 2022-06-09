import yargs from 'yargs';
declare const args: {
    readonly set: {
        readonly demandOption: false;
        readonly default: "";
        readonly type: "string";
        readonly describe: "Set default editor for Graphite. eg --set vim";
    };
    readonly unset: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Unset default editor for Graphite. eg --unset";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "editor";
export declare const description = "The editor opened by Graphite";
export declare const canonical = "user editor";
export declare const builder: {
    readonly set: {
        readonly demandOption: false;
        readonly default: "";
        readonly type: "string";
        readonly describe: "Set default editor for Graphite. eg --set vim";
    };
    readonly unset: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Unset default editor for Graphite. eg --unset";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
