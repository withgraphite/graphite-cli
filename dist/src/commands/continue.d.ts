import yargs from 'yargs';
declare const args: {
    readonly all: {
        readonly describe: "Stage all changes before continuing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "continue";
export declare const canonical = "continue";
export declare const aliases: string[];
export declare const description = "Continues the most recent Graphite command halted by a merge conflict.";
export declare const builder: {
    readonly all: {
        readonly describe: "Stage all changes before continuing.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
