import yargs from 'yargs';
declare const args: {
    readonly set: {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Set a new prefix for .";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "branch-prefix";
export declare const canonical = "user branch-prefix";
export declare const description = "The prefix which Graphite will prepend to all auto-generated branch names (i.e. when you don't specify a branch name when calling `gt branch create`).";
export declare const builder: {
    readonly set: {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Set a new prefix for .";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
