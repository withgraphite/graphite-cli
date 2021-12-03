import yargs from "yargs";
declare const args: {
    readonly set: {
        readonly type: "string";
        readonly describe: "Manually set the stack parent of the current branch. This operation only modifies Graphite metadata and does not rebase any branches.";
        readonly required: false;
    };
    readonly reset: {
        readonly type: "boolean";
        readonly describe: "Disassociate the branch from its current tracked parent.";
        readonly required: false;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "parent";
export declare const canonical = "branch parent";
export declare const description = "Show the parent branch of your current branch (i.e. directly below the current branch in the stack) as tracked by Graphite. Branch location metadata is stored under `.git/refs/branch-metadata`.";
export declare const builder: {
    readonly set: {
        readonly type: "string";
        readonly describe: "Manually set the stack parent of the current branch. This operation only modifies Graphite metadata and does not rebase any branches.";
        readonly required: false;
    };
    readonly reset: {
        readonly type: "boolean";
        readonly describe: "Disassociate the branch from its current tracked parent.";
        readonly required: false;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
