import yargs from 'yargs';
declare const args: {
    readonly pr: {
        readonly describe: "An PR number or branch name to open.";
        readonly demandOption: false;
        readonly positional: true;
        readonly type: "string";
    };
};
export declare const command = "pr [pr]";
export declare const description = "Opens the PR page for the current branch.";
export declare const builder: {
    readonly pr: {
        readonly describe: "An PR number or branch name to open.";
        readonly demandOption: false;
        readonly positional: true;
        readonly type: "string";
    };
};
export declare const canonical = "dash pr";
export declare const aliases: string[];
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
