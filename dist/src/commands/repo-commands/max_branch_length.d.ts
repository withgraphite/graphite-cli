import yargs from "yargs";
declare const args: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "number";
        readonly alias: "s";
        readonly describe: "Override the max number of commits on a branch Graphite will track.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "max-branch-length";
export declare const canonical = "repo max-branch-length";
export declare const description = "Graphite will track up to this many commits on a branch. e.g. If this is set to 50, Graphite can track branches up to 50 commits long. Increasing this setting may result in slower performance for Graphite.";
export declare const builder: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "number";
        readonly alias: "s";
        readonly describe: "Override the max number of commits on a branch Graphite will track.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
