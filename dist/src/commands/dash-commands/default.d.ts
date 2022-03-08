import yargs from 'yargs';
declare const args: {};
export declare const command = "*";
export declare const description = "Opens your Graphite dashboard in the web.";
export declare const builder: {};
export declare const canonical = "dash";
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
