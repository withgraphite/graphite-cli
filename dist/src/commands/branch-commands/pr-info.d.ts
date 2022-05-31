import yargs from 'yargs';
declare const args: {
    readonly reset: {
        readonly describe: "Removes current GitHub PR information linked to the current branch";
        readonly demandOption: false;
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const aliases: never[];
export declare const command = "pr-info";
export declare const canonical = "branch pr-info";
export declare const description = "Fetch GitHub PR information for the current branch.";
export declare const builder: {
    readonly reset: {
        readonly describe: "Removes current GitHub PR information linked to the current branch";
        readonly demandOption: false;
        readonly type: "boolean";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
