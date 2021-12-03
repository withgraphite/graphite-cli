import yargs from "yargs";
declare const args: {
    readonly add: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly describe: "Add a branch to be ignored by Graphite.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "ignored-branches";
export declare const canonical = "repo ignore-branches";
export declare const description = "Specify branches for Graphite to ignore. Often branches that you never plan to create PRs and merge into trunk.";
export declare const builder: {
    readonly add: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly describe: "Add a branch to be ignored by Graphite.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
