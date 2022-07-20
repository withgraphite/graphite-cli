import yargs from 'yargs';
declare const args: {
    readonly enable: {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Enable date in auto-generated branch names";
    };
    readonly disable: {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Disable date in auto-generated branch names";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "branch-date";
export declare const canonical = "user branch-date";
export declare const description = "Toggle prepending date to auto-generated branch names on branch creation.";
export declare const builder: {
    readonly enable: {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Enable date in auto-generated branch names";
    };
    readonly disable: {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Disable date in auto-generated branch names";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
