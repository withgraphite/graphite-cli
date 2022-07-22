import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Optional branch to checkout";
        readonly demandOption: false;
        readonly type: "string";
        readonly positional: true;
        readonly hidden: true;
    };
    readonly 'show-untracked': {
        readonly describe: "Include untracked branched in interactive selection";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly positional: false;
        readonly alias: "u";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "checkout [branch]";
export declare const canonical = "branch checkout";
export declare const description = "Switch to a branch. If no branch is provided, opens an interactive selector.";
export declare const aliases: string[];
export declare const builder: {
    readonly branch: {
        readonly describe: "Optional branch to checkout";
        readonly demandOption: false;
        readonly type: "string";
        readonly positional: true;
        readonly hidden: true;
    };
    readonly 'show-untracked': {
        readonly describe: "Include untracked branched in interactive selection";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly positional: false;
        readonly alias: "u";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
