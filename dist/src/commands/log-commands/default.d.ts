import yargs from 'yargs';
declare const args: {
    readonly reverse: {
        readonly describe: "Print the log upside down. Handy when you have a lot of branches!";
        readonly type: "boolean";
        readonly alias: "r";
        readonly default: false;
    };
    readonly stack: {
        readonly describe: "Only show ancestors and descendants of the current branch.";
        readonly type: "boolean";
        readonly alias: "s";
        readonly default: false;
    };
    readonly steps: {
        readonly describe: "Only show this many levels upstack and downstack. Implies --stack.";
        readonly type: "number";
        readonly alias: "n";
        readonly default: undefined;
    };
};
export declare const command = "*";
export declare const description = "Log all branches tracked by Graphite, showing dependencies and info for each.";
export declare const builder: {
    readonly reverse: {
        readonly describe: "Print the log upside down. Handy when you have a lot of branches!";
        readonly type: "boolean";
        readonly alias: "r";
        readonly default: false;
    };
    readonly stack: {
        readonly describe: "Only show ancestors and descendants of the current branch.";
        readonly type: "boolean";
        readonly alias: "s";
        readonly default: false;
    };
    readonly steps: {
        readonly describe: "Only show this many levels upstack and downstack. Implies --stack.";
        readonly type: "number";
        readonly alias: "n";
        readonly default: undefined;
    };
};
export declare const canonical = "log";
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
