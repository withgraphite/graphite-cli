import yargs from 'yargs';
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "validate";
export declare const description = "Validate that Graphite's stack metadata for all upstack branches matches the branch relationships stored in git.";
export declare const builder: {};
export declare const canonical = "upstack validate";
export declare const handler: (argv: argsT) => Promise<void>;
export {};
