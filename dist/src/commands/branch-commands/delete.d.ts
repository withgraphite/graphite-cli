import yargs from "yargs";
declare const args: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: true;
        readonly optional: false;
        readonly describe: "The name of the branch to delete.";
    };
    readonly force: {
        readonly describe: "Force delete the git branch.";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly alias: "D";
        readonly default: false;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const aliases: string[];
export declare const command = "delete [name]";
export declare const canonical = "branch delete";
export declare const description = "Delete a given git branch and its corresponding Graphite metadata.";
export declare const builder: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: true;
        readonly optional: false;
        readonly describe: "The name of the branch to delete.";
    };
    readonly force: {
        readonly describe: "Force delete the git branch.";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly alias: "D";
        readonly default: false;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
