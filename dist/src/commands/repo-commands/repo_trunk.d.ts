import yargs from "yargs";
declare const args: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the value of the repo's trunk branch in the Graphite config.";
    };
};
export declare const command = "trunk";
export declare const canonical = "repo trunk";
export declare const description = "The trunk branch of the current repo. Graphite uses the trunk branch as the base of all stacks.";
export declare const builder: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the value of the repo's trunk branch in the Graphite config.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
