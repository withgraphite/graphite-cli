import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Optional branch to rebase the current stack onto.";
        readonly demandOption: false;
        readonly positional: true;
        readonly type: "string";
    };
};
export declare const command = "onto [branch]";
export declare const canonical = "upstack onto";
export declare const description = "Rebase all upstack branches onto the latest commit (tip) of the target branch.";
export declare const builder: {
    readonly branch: {
        readonly describe: "Optional branch to rebase the current stack onto.";
        readonly demandOption: false;
        readonly positional: true;
        readonly type: "string";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
