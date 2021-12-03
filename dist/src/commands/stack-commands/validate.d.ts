import yargs from "yargs";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "validate";
export declare const canonical = "stack validate";
export declare const description = "Validate that Graphite's stack metadata for the current stack matches git's record of branch relationships.";
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
