import yargs from 'yargs';
declare const args: {
    readonly message: {
        readonly type: "string";
        readonly alias: "m";
        readonly describe: "The updated message for the commit.";
        readonly demandOption: false;
    };
    readonly edit: {
        readonly type: "boolean";
        readonly describe: "Modify the existing commit message.";
        readonly demandOption: false;
        readonly default: true;
    };
    readonly 'no-edit': {
        readonly type: "boolean";
        readonly describe: "Don't modify the existing commit message. Takes precedence over --edit";
        readonly demandOption: false;
        readonly default: false;
        readonly alias: "n";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "squash";
export declare const canonical = "branch squash";
export declare const aliases: string[];
export declare const description = "Squash all commits in the current branch and restack upstack branches.";
export declare const builder: {
    readonly message: {
        readonly type: "string";
        readonly alias: "m";
        readonly describe: "The updated message for the commit.";
        readonly demandOption: false;
    };
    readonly edit: {
        readonly type: "boolean";
        readonly describe: "Modify the existing commit message.";
        readonly demandOption: false;
        readonly default: true;
    };
    readonly 'no-edit': {
        readonly type: "boolean";
        readonly describe: "Don't modify the existing commit message. Takes precedence over --edit";
        readonly demandOption: false;
        readonly default: false;
        readonly alias: "n";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
