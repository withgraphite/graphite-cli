import yargs from 'yargs';
declare const args: {
    readonly patch: {
        readonly describe: "Show the changes made by each commit.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "show";
export declare const canonical = "branch show";
export declare const description = "Show the commits of the current branch.";
export declare const builder: {
    readonly patch: {
        readonly describe: "Show the changes made by each commit.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
