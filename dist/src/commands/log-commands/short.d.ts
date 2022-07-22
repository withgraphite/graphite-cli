import yargs from 'yargs';
declare const args: {
    readonly classic: {
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "c";
        readonly describe: "Use the old logging style, which runs out of screen real estate quicker. Other options will not work in classic mode.";
    };
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
    readonly 'show-untracked': {
        readonly describe: "Include untracked branched in interactive selection";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly positional: false;
        readonly alias: "u";
    };
};
export declare const command = "short";
export declare const description = "Log all stacks tracked by Graphite, arranged to show dependencies.";
export declare const builder: {
    readonly classic: {
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "c";
        readonly describe: "Use the old logging style, which runs out of screen real estate quicker. Other options will not work in classic mode.";
    };
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
    readonly 'show-untracked': {
        readonly describe: "Include untracked branched in interactive selection";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly positional: false;
        readonly alias: "u";
    };
};
export declare const aliases: string[];
export declare const canonical = "log short";
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
