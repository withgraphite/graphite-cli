import yargs from 'yargs';
declare const args: {
    readonly input: {
        readonly describe: "Path to file specifying stack edits. Using this argument skips prompting for stack edits and assumes the user has already formatted a list. Primarly used for unit tests.";
        readonly demandOption: false;
        readonly hidden: true;
        readonly type: "string";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "edit";
export declare const canonical = "downstack edit";
export declare const description = "Edit the order of the branches between trunk and the current branch, restacking all of their descendants.";
export declare const builder: {
    readonly input: {
        readonly describe: "Path to file specifying stack edits. Using this argument skips prompting for stack edits and assumes the user has already formatted a list. Primarly used for unit tests.";
        readonly demandOption: false;
        readonly hidden: true;
        readonly type: "string";
    };
};
export declare const aliases: string[];
export declare const handler: (argv: argsT) => Promise<void>;
export {};
