import yargs from 'yargs';
declare const args: {
    readonly trunk: {
        readonly describe: "The name of your trunk branch.";
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
    };
    readonly 'ignore-branches': {
        readonly describe: "A list of branches that Graphite should ignore when tracking your stacks (i.e. branches you never intend to merge into trunk).";
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
        readonly array: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "init";
export declare const canonical = "repo init";
export declare const description = "Create or regenerate a `.graphite_repo_config` file.";
export declare const builder: {
    readonly trunk: {
        readonly describe: "The name of your trunk branch.";
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
    };
    readonly 'ignore-branches': {
        readonly describe: "A list of branches that Graphite should ignore when tracking your stacks (i.e. branches you never intend to merge into trunk).";
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
        readonly array: true;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
