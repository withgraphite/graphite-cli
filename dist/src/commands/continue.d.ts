import yargs from "yargs";
declare const args: {
    readonly edit: {
        readonly describe: "Edit the commit message for an amended, resolved merge conflict. By default true; use --no-edit to set this to false.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "continue";
export declare const canonical = "continue";
export declare const aliases: never[];
export declare const description = "Continues the most-recent Graphite command halted by a merge conflict.";
export declare const builder: {
    readonly edit: {
        readonly describe: "Edit the commit message for an amended, resolved merge conflict. By default true; use --no-edit to set this to false.";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
