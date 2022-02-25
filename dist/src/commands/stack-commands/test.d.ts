import yargs from 'yargs';
declare const args: {
    readonly command: {
        readonly describe: "The command you'd like to run on each branch of your stack.";
        readonly demandOption: true;
        readonly type: "string";
        readonly alias: "c";
        readonly positional: true;
    };
    readonly 'skip-trunk': {
        readonly describe: "Dont run the command on the trunk branch.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "test <command>";
export declare const canonical = "stack test";
export declare const aliases: string[];
export declare const description = "Checkout each branch in your stack, run the provided command, and aggregate the results. Good finding bugs in your stack.";
export declare const builder: {
    readonly command: {
        readonly describe: "The command you'd like to run on each branch of your stack.";
        readonly demandOption: true;
        readonly type: "string";
        readonly alias: "c";
        readonly positional: true;
    };
    readonly 'skip-trunk': {
        readonly describe: "Dont run the command on the trunk branch.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
