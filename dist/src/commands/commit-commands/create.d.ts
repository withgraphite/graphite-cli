import yargs from 'yargs';
declare const args: {
    readonly all: {
        readonly describe: "Stage all changes before committing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly message: {
        readonly type: "string";
        readonly alias: "m";
        readonly describe: "The message for the new commit.";
        readonly required: false;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "create";
export declare const canonical = "commit create";
export declare const aliases: string[];
export declare const description = "Create a new commit and restack upstack branches.";
export declare const builder: {
    readonly all: {
        readonly describe: "Stage all changes before committing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly message: {
        readonly type: "string";
        readonly alias: "m";
        readonly describe: "The message for the new commit.";
        readonly required: false;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
