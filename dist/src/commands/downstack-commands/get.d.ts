import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Branch to get from remote";
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "get [branch]";
export declare const canonical = "downstack get";
export declare const description = "Get branches from trunk to the specified branch from remote, prompting the user to resolve conflicts.";
export declare const builder: {
    readonly branch: {
        readonly describe: "Branch to get from remote";
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
    };
};
export declare const aliases: string[];
export declare const handler: (argv: argsT) => Promise<void>;
export {};
