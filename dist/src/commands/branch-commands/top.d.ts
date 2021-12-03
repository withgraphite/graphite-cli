import yargs from "yargs";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "top";
export declare const canonical = "branch top";
export declare const aliases: string[];
export declare const description = "If you're in a stack: Branch A \u2192 Branch B (you are here) \u2192 Branch C \u2192 Branch D , checkout the branch at the top of the stack (Branch D). If there are multiple parent branches in the stack, `gt branch top` will prompt you to choose which branch to checkout.";
export declare const handler: (argv: argsT) => Promise<void>;
export {};
