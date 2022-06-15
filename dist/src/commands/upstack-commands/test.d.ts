import yargs from 'yargs';
declare const args: {
    readonly command: {
        readonly describe: "The command you'd like to run on each branch of your upstack.";
        readonly demandOption: true;
        readonly type: "string";
        readonly alias: "c";
        readonly positional: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "test <command>";
export declare const canonical = "upstack test";
export declare const aliases: string[];
export declare const description = "For each of the current branch and its descendants, run the provided command and aggregate the results.";
export declare const builder: {
    readonly command: {
        readonly describe: "The command you'd like to run on each branch of your upstack.";
        readonly demandOption: true;
        readonly type: "string";
        readonly alias: "c";
        readonly positional: true;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
