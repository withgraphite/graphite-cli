import yargs from 'yargs';
declare const args: {
    readonly "include-commit-messages": {
        readonly demandOption: false;
        readonly type: "boolean";
        readonly describe: "Include commit messages in PR body by default.  Disable with --no-include-commit-messages.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "submit-body";
export declare const description = "Options for default PR descriptions.";
export declare const canonical = "user submit-body";
export declare const builder: {
    readonly "include-commit-messages": {
        readonly demandOption: false;
        readonly type: "boolean";
        readonly describe: "Include commit messages in PR body by default.  Disable with --no-include-commit-messages.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
