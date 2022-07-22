import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Branch to stop tracking.";
        readonly demandOption: true;
        readonly positional: true;
        readonly type: "string";
        readonly hidden: true;
    };
    readonly force: {
        readonly describe: "Will not prompt for confirmation before untracking a branch with children.";
        readonly alias: "f";
        readonly default: false;
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "untrack <branch>";
export declare const canonical = "branch untrack";
export declare const aliases: string[];
export declare const description = "Stop tracking a branch with Graphite. If the branch has children, they will also be untracked.";
export declare const builder: {
    readonly branch: {
        readonly describe: "Branch to stop tracking.";
        readonly demandOption: true;
        readonly positional: true;
        readonly type: "string";
        readonly hidden: true;
    };
    readonly force: {
        readonly describe: "Will not prompt for confirmation before untracking a branch with children.";
        readonly alias: "f";
        readonly default: false;
        readonly type: "boolean";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
