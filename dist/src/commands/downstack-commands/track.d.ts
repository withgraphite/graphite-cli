import yargs from 'yargs';
declare const args: {
    readonly force: {
        readonly describe: "Sets the parent of each branch to the most recent ancestor without interactive selection.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "track";
export declare const canonical = "downstack track";
export declare const aliases: string[];
export declare const description = "Track a series of untracked branches, by specifying each branch's parent, stopping when you reach a tracked branch.";
export declare const builder: {
    readonly force: {
        readonly describe: "Sets the parent of each branch to the most recent ancestor without interactive selection.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
