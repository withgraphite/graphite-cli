import yargs from 'yargs';
declare const args: {
    readonly set: {
        readonly optional: true;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the value of the repo's name in the Graphite config. This is expected to match the name of the repo on GitHub and should only be set in cases where Graphite is incorrectly inferring the repo name.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "name";
export declare const canonical = "repo name";
export declare const description = "The current repo's name stored in Graphite. e.g. in 'withgraphite/graphite-cli', this is 'graphite-cli'.";
export declare const builder: {
    readonly set: {
        readonly optional: true;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the value of the repo's name in the Graphite config. This is expected to match the name of the repo on GitHub and should only be set in cases where Graphite is incorrectly inferring the repo name.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
