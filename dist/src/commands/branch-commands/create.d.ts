import yargs from 'yargs';
declare const args: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the new branch.";
    };
    readonly 'commit-message': {
        readonly describe: "Commit staged changes on the new branch with this message.";
        readonly demandOption: false;
        readonly type: "string";
        readonly alias: "m";
    };
    readonly 'add-all': {
        readonly describe: "Stage all un-staged changes on the new branch with this message.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly restack: {
        readonly describe: "Restack all existing children of the parent branch onto the new branch.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "r";
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
    };
    readonly 'commit-message': {
        readonly describe: "Commit staged changes on the new branch with this message.";
        readonly demandOption: false;
        readonly type: "string";
        readonly alias: "m";
    };
    readonly 'add-all': {
        readonly describe: "Stage all un-staged changes on the new branch with this message.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly restack: {
        readonly describe: "Restack all existing children of the parent branch onto the new branch.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "r";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
