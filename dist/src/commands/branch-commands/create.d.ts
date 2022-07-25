import yargs from 'yargs';
declare const args: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the new branch.";
        readonly hidden: true;
    };
    readonly message: {
        readonly describe: "Commit staged changes on the new branch with this message.";
        readonly demandOption: false;
        readonly type: "string";
        readonly alias: "m";
    };
    readonly all: {
        readonly describe: "Stage all unstaged changes on the new branch with this message.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly patch: {
        readonly describe: "Pick hunks to stage before committing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
    readonly insert: {
        readonly describe: "When true, any existing children of the current branch will become children of the new branch.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "i";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const aliases: string[];
export declare const command = "create [name]";
export declare const canonical = "branch create";
export declare const description = "Create a new branch stacked on top of the current branch and commit staged changes. If no branch name is specified but a commit message is passed, generate a branch name from the commit message.";
export declare const builder: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the new branch.";
        readonly hidden: true;
    };
    readonly message: {
        readonly describe: "Commit staged changes on the new branch with this message.";
        readonly demandOption: false;
        readonly type: "string";
        readonly alias: "m";
    };
    readonly all: {
        readonly describe: "Stage all unstaged changes on the new branch with this message.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly patch: {
        readonly describe: "Pick hunks to stage before committing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
    readonly insert: {
        readonly describe: "When true, any existing children of the current branch will become children of the new branch.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "i";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
