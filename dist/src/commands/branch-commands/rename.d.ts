import yargs from "yargs";
declare const args: {
    readonly "new-branch-name": {
        readonly describe: "The new name for the current branch";
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "rename <new-branch-name>";
export declare const canonical = "branch rename";
export declare const description = "Rename a branch and update metadata referencing it.";
export declare const builder: {
    readonly "new-branch-name": {
        readonly describe: "The new name for the current branch";
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
    };
};
export declare const handler: (args: argsT) => Promise<void>;
export {};
