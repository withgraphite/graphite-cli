import yargs from 'yargs';
declare const args: {
    readonly pull: {
        readonly describe: "Pull the trunk branch from remote.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "p";
    };
    readonly delete: {
        readonly describe: "Delete branches which have been merged.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly 'show-delete-progress': {
        readonly describe: "Show progress through merged branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
    readonly force: {
        readonly describe: "Don't prompt for confirmation before deleting a branch.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly restack: {
        readonly describe: "Restack the current stack and any stacks with deleted branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "r";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "sync";
export declare const canonical = "repo sync";
export declare const aliases: string[];
export declare const description = "Pull the trunk branch from remote and delete any branches that have been merged.";
export declare const builder: {
    readonly pull: {
        readonly describe: "Pull the trunk branch from remote.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "p";
    };
    readonly delete: {
        readonly describe: "Delete branches which have been merged.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly 'show-delete-progress': {
        readonly describe: "Show progress through merged branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
    readonly force: {
        readonly describe: "Don't prompt for confirmation before deleting a branch.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly restack: {
        readonly describe: "Restack the current stack and any stacks with deleted branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "r";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
