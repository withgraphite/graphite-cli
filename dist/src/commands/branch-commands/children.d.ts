import yargs from "yargs";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "children";
export declare const canonical = "branch children";
export declare const description = "Show the child branches of your current branch (i.e. directly above the current branch in the stack) as tracked by Graphite. Branch location metadata is stored under `.git/refs/branch-metadata`.";
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
