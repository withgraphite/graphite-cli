import yargs from 'yargs';
declare const args: {
    readonly all: {
        readonly describe: "Stage all changes before committing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
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
    readonly patch: {
        readonly describe: "Pick hunks to stage before amending.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
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
export declare const command = "amend";
export declare const canonical = "commit amend";
export declare const aliases: string[];
export declare const description = "Amend the most recent commit and restack upstack branches.";
export declare const builder: {
    readonly all: {
        readonly describe: "Stage all changes before committing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
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
    readonly patch: {
        readonly describe: "Pick hunks to stage before amending.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
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
