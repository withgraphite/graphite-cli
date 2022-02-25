import yargs from 'yargs';
declare const args: {
    readonly set: {
        readonly optional: false;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the value of the repo owner's name in the Graphite config. This is expected to match the name of the repo owner on GitHub and should only be set in cases where Graphite is incorrectly inferring the repo owner's name.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "owner";
export declare const canonical = "repo owner";
export declare const description = "The current repo owner's name stored in Graphite. e.g. in 'screenplaydev/graphite-cli', this is 'screenplaydev'.";
export declare const builder: {
    readonly set: {
        readonly optional: false;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the value of the repo owner's name in the Graphite config. This is expected to match the name of the repo owner on GitHub and should only be set in cases where Graphite is incorrectly inferring the repo owner's name.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
