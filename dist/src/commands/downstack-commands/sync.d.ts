import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Branch to sync from";
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "sync [branch]";
export declare const canonical = "downstack sync";
export declare const description = "Sync a branch and its downstack from remote.";
export declare const builder: {
    readonly branch: {
        readonly describe: "Branch to sync from";
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
