import yargs from 'yargs';
declare const args: {
    readonly trunk: {
        readonly describe: "The name of your trunk branch.";
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
    };
    readonly reset: {
        readonly describe: "Untrack all branches.";
        readonly default: false;
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "init";
export declare const aliases: string[];
export declare const canonical = "repo init";
export declare const description = "Create or regenerate a `.graphite_repo_config` file.";
export declare const builder: {
    readonly trunk: {
        readonly describe: "The name of your trunk branch.";
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
    };
    readonly reset: {
        readonly describe: "Untrack all branches.";
        readonly default: false;
        readonly type: "boolean";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
