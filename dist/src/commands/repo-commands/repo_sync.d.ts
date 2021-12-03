import yargs from "yargs";
declare const args: {
    readonly delete: {
        readonly describe: "Delete branches which have been merged.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly "show-delete-progress": {
        readonly describe: "Show progress through merged branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
    readonly resubmit: {
        readonly describe: "Re-submit branches whose merge bases have changed locally and now differ from their PRs.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "r";
    };
    readonly force: {
        readonly describe: "Don't prompt you to confirm when a branch will be deleted or re-submitted.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly pull: {
        readonly describe: "Pull the trunk branch from remote before searching for stale branches.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "p";
    };
    readonly "show-dangling": {
        readonly describe: "Show prompts to fix dangling branches (branches for whose parent is unknown to Graphite).";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "s";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "sync";
export declare const canonical = "repo sync";
export declare const aliases: string[];
export declare const description = "Delete any branches that have been merged or squashed into the trunk branch, and fix their upstack branches recursively.";
export declare const builder: {
    readonly delete: {
        readonly describe: "Delete branches which have been merged.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly "show-delete-progress": {
        readonly describe: "Show progress through merged branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
    readonly resubmit: {
        readonly describe: "Re-submit branches whose merge bases have changed locally and now differ from their PRs.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "r";
    };
    readonly force: {
        readonly describe: "Don't prompt you to confirm when a branch will be deleted or re-submitted.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly pull: {
        readonly describe: "Pull the trunk branch from remote before searching for stale branches.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "p";
    };
    readonly "show-dangling": {
        readonly describe: "Show prompts to fix dangling branches (branches for whose parent is unknown to Graphite).";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "s";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
