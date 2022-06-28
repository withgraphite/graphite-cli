import yargs from 'yargs';
declare const args: {
    readonly name: {
        readonly describe: "The new name for the current branch.";
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
    };
    readonly force: {
        readonly describe: "Allow renaming a branch that is already associated with an open GitHub pull request.";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly alias: "f";
        readonly default: false;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "rename <name>";
export declare const aliases: string[];
export declare const canonical = "branch rename";
export declare const description = "Rename a branch and update metadata referencing it.  Note that this removes any associated GitHub pull request.";
export declare const builder: {
    readonly name: {
        readonly describe: "The new name for the current branch.";
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
    };
    readonly force: {
        readonly describe: "Allow renaming a branch that is already associated with an open GitHub pull request.";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly alias: "f";
        readonly default: false;
    };
};
export declare const handler: (args: argsT) => Promise<void>;
export {};
