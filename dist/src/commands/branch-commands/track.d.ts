import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Branch to begin tracking. Defaults to the current branch.";
        readonly demandOption: false;
        readonly positional: true;
        readonly type: "string";
    };
    readonly parent: {
        readonly describe: "The tracked branch's parent. If unset, prompts for a parent branch";
        readonly demandOption: false;
        readonly positional: false;
        readonly type: "string";
        readonly alias: "p";
    };
    readonly force: {
        readonly describe: "Sets the parent to the most recent tracked ancestor of the branch being tracked. Takes precedence over `--parent`";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "track [branch]";
export declare const canonical = "branch track";
export declare const aliases: string[];
export declare const description: string;
export declare const builder: {
    readonly branch: {
        readonly describe: "Branch to begin tracking. Defaults to the current branch.";
        readonly demandOption: false;
        readonly positional: true;
        readonly type: "string";
    };
    readonly parent: {
        readonly describe: "The tracked branch's parent. If unset, prompts for a parent branch";
        readonly demandOption: false;
        readonly positional: false;
        readonly type: "string";
        readonly alias: "p";
    };
    readonly force: {
        readonly describe: "Sets the parent to the most recent tracked ancestor of the branch being tracked. Takes precedence over `--parent`";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
