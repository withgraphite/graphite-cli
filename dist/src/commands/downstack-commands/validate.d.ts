import yargs from "yargs";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "validate";
export declare const canonical = "downstack validate";
export declare const description = "Validate that Graphite's stack metadata for all downstack branches matches the branch relationships stored in git.";
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
