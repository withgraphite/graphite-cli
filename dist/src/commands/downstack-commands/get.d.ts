import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Branch to get from remote";
        readonly demandOption: false;
        readonly type: "string";
        readonly positional: true;
        readonly hidden: true;
    };
    readonly force: {
        readonly describe: "Overwrite all fetched branches with remote source of truth";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "f";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "get [branch]";
export declare const canonical = "downstack get";
export declare const description = "Get branches from trunk to the specified branch from remote, prompting the user to resolve conflicts. If no branch is provided, get downstack from the current branch.";
export declare const builder: {
    readonly branch: {
        readonly describe: "Branch to get from remote";
        readonly demandOption: false;
        readonly type: "string";
        readonly positional: true;
        readonly hidden: true;
    };
    readonly force: {
        readonly describe: "Overwrite all fetched branches with remote source of truth";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "f";
    };
};
export declare const aliases: string[];
export declare const handler: (argv: argsT) => Promise<void>;
export {};
