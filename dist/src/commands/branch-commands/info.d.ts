import yargs from 'yargs';
declare const args: {
    readonly patch: {
        readonly describe: "Show the changes made by each commit.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
    readonly description: {
        readonly describe: "Show the PR description, if it exists.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "d";
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
    readonly description: {
        readonly describe: "Show the PR description, if it exists.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "d";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
