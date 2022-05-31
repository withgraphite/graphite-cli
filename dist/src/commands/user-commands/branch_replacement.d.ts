import yargs from 'yargs';
declare const args: {
    readonly "set-underscore": {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Use underscore (_) as the replacement character";
    };
    readonly "set-dash": {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Use dash (-) as the replacement character";
    };
    readonly "set-empty": {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Remove invalid characters from the branch name without replacing them";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "branch-replacement";
export declare const canonical = "user branch-replacement";
export declare const description = "Graphite only supports alphanumeric characters, underscores, and dashes in branch names.  Use this command to set what unsupported characters will be replaced with.";
export declare const builder: {
    readonly "set-underscore": {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Use underscore (_) as the replacement character";
    };
    readonly "set-dash": {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Use dash (-) as the replacement character";
    };
    readonly "set-empty": {
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "boolean";
        readonly describe: "Remove invalid characters from the branch name without replacing them";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
