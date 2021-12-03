import yargs from "yargs";
export declare const command = "demo";
export declare const canonical = "demo";
export declare const description = false;
declare const args: {};
export declare const builder: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
