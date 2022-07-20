import yargs from 'yargs';
declare const args: {
    readonly "by-commit": {
        readonly describe: "Split by commit - slice up the history of this branch.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: readonly ["c", "commit"];
    };
    readonly "by-hunk": {
        readonly describe: "Split by hunk - split into new single-commit branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: readonly ["h", "hunk"];
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "split";
export declare const canonical = "branch split";
export declare const aliases: string[];
export declare const description = "Split the current branch into multiple single-commit branches.";
export declare const builder: {
    readonly "by-commit": {
        readonly describe: "Split by commit - slice up the history of this branch.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: readonly ["c", "commit"];
    };
    readonly "by-hunk": {
        readonly describe: "Split by hunk - split into new single-commit branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: readonly ["h", "hunk"];
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
