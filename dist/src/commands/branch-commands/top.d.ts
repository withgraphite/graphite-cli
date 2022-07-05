import yargs from 'yargs';
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "top";
export declare const canonical = "branch top";
export declare const aliases: string[];
export declare const description = "Switch to the tip branch of the current stack. Prompts if ambiguous.";
export declare const handler: (argv: argsT) => Promise<void>;
export {};
