import yargs from 'yargs';
declare const args: {
    readonly all: {
        readonly describe: "Stage all changes before continuing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly edit: {
        readonly describe: "Modify the existing commit message for an amended, resolved merge conflict.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
    };
    readonly 'no-edit': {
        readonly type: "boolean";
        readonly describe: "Don't modify the existing commit message. Takes precedence over --edit";
        readonly demandOption: false;
        readonly default: false;
        readonly alias: "n";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "continue";
export declare const canonical = "continue";
export declare const aliases: never[];
export declare const description = "Continues the most-recent Graphite command halted by a merge conflict.";
export declare const builder: {
    readonly all: {
        readonly describe: "Stage all changes before continuing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly edit: {
        readonly describe: "Modify the existing commit message for an amended, resolved merge conflict.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
    };
    readonly 'no-edit': {
        readonly type: "boolean";
        readonly describe: "Don't modify the existing commit message. Takes precedence over --edit";
        readonly demandOption: false;
        readonly default: false;
        readonly alias: "n";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
