import yargs from "yargs";
declare const args: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "number";
        readonly alias: "s";
        readonly describe: "Override the max age of branches (behind trunk) Graphite will track.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "max-days-behind-trunk";
export declare const canonical = "repo max-days-behind-trunk";
export declare const description = "Graphite will track branches that lag up to this many days behind trunk. e.g. If this is set to 90, Graphite log/Graphite stacks commands will show all stacks up to 90 days behind trunk.";
export declare const builder: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "number";
        readonly alias: "s";
        readonly describe: "Override the max age of branches (behind trunk) Graphite will track.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
