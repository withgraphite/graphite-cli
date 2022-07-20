import yargs from 'yargs';
declare const args: {
    readonly command: {
        readonly describe: "The command you'd like to run on each branch of your stack.";
        readonly demandOption: true;
        readonly type: "string";
        readonly alias: "c";
        readonly positional: true;
        readonly hidden: true;
    };
    readonly trunk: {
        readonly describe: "Run the command on the trunk branch in addition to the rest of the stack.";
        readonly demandOption: false;
        readonly default: false;
        readonly alias: "t";
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "test <command>";
export declare const canonical = "stack test";
export declare const aliases: string[];
export declare const description = "Run the provided command on each branch in the current stack and aggregate the results.";
export declare const builder: {
    readonly command: {
        readonly describe: "The command you'd like to run on each branch of your stack.";
        readonly demandOption: true;
        readonly type: "string";
        readonly alias: "c";
        readonly positional: true;
        readonly hidden: true;
    };
    readonly trunk: {
        readonly describe: "Run the command on the trunk branch in addition to the rest of the stack.";
        readonly demandOption: false;
        readonly default: false;
        readonly alias: "t";
        readonly type: "boolean";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
