import yargs from 'yargs';
declare const args: {
    readonly patch: {
        readonly describe: "Show the changes made by each commit.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
    readonly diff: {
        readonly describe: "Show the diff between this branch and its parent. Takes precedence over patch";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly body: {
        readonly describe: "Show the PR body, if it exists.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "b";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "info";
export declare const canonical = "branch info";
export declare const aliases: string[];
export declare const description = "Display information about the current branch.";
export declare const builder: {
    readonly patch: {
        readonly describe: "Show the changes made by each commit.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
    readonly diff: {
        readonly describe: "Show the diff between this branch and its parent. Takes precedence over patch";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly body: {
        readonly describe: "Show the PR body, if it exists.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "b";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
