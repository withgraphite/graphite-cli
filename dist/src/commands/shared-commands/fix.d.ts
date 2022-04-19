import yargs from 'yargs';
export declare const command = "fix";
export declare const args: {
    readonly rebase: {
        readonly describe: "Fix your stack by recursively rebasing branches onto their parents, as recorded in Graphite's stack metadata.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
    readonly regen: {
        readonly describe: "Regenerate Graphite's stack metadata from the branch relationships in the git commit tree, overwriting the previous Graphite stack metadata.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
};
export declare const builder: {
    readonly rebase: {
        readonly describe: "Fix your stack by recursively rebasing branches onto their parents, as recorded in Graphite's stack metadata.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
    readonly regen: {
        readonly describe: "Regenerate Graphite's stack metadata from the branch relationships in the git commit tree, overwriting the previous Graphite stack metadata.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
};
export declare const aliases: string[];
export declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
