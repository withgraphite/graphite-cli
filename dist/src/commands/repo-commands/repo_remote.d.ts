import yargs from 'yargs';
declare const args: {
    readonly set: {
        readonly optional: false;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the name of the remote repository. Only set this if you are using a remote other than 'origin'.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "owner";
export declare const canonical = "repo remote";
export declare const description = "Specifies the remote that graphite pushes to/pulls from (defaults to 'origin')";
export declare const builder: {
    readonly set: {
        readonly optional: false;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the name of the remote repository. Only set this if you are using a remote other than 'origin'.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
