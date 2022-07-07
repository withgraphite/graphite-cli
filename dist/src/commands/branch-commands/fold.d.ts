import yargs from 'yargs';
declare const args: {
    readonly keep: {
        readonly describe: "Keeps the name of the current branch instead of using the name of its parent.";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly alias: "k";
        readonly default: false;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const aliases: string[];
export declare const command = "fold";
export declare const canonical = "branch fold";
export declare const description = "Fold a branch's changes into its parent, update dependencies of descendants of the new combined branch, and restack.";
export declare const builder: {
    readonly keep: {
        readonly describe: "Keeps the name of the current branch instead of using the name of its parent.";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly alias: "k";
        readonly default: false;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
