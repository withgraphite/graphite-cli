import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Branch to begin tracking.";
        readonly demandOption: false;
        readonly positional: true;
        readonly type: "string";
    };
    readonly parent: {
        readonly describe: "The tracked branch's parent. Defaults to the current branch.";
        readonly demandOption: false;
        readonly positional: false;
        readonly type: "string";
        readonly alias: "p";
    };
    readonly force: {
        readonly describe: string;
        readonly alias: "f";
        readonly default: false;
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "track [branch]";
export declare const canonical = "branch track";
export declare const aliases: string[];
export declare const description: string;
export declare const builder: {
    readonly branch: {
        readonly describe: "Branch to begin tracking.";
        readonly demandOption: false;
        readonly positional: true;
        readonly type: "string";
    };
    readonly parent: {
        readonly describe: "The tracked branch's parent. Defaults to the current branch.";
        readonly demandOption: false;
        readonly positional: false;
        readonly type: "string";
        readonly alias: "p";
    };
    readonly force: {
        readonly describe: string;
        readonly alias: "f";
        readonly default: false;
        readonly type: "boolean";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
