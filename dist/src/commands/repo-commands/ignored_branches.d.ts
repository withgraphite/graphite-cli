import yargs from 'yargs';
declare const args: {
    readonly add: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly describe: "Add a branch or glob pattern to be ignored by Graphite.";
    };
    readonly remove: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly describe: "Remove a branch or glob pattern from being ignored by Graphite.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "ignored-branches";
export declare const canonical = "repo ignore-branches";
export declare const description: string;
export declare const builder: {
    readonly add: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly describe: "Add a branch or glob pattern to be ignored by Graphite.";
    };
    readonly remove: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly describe: "Remove a branch or glob pattern from being ignored by Graphite.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
