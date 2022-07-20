import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Optional branch to rebase the current stack onto.";
        readonly demandOption: false;
        readonly positional: true;
        readonly hidden: true;
        readonly type: "string";
    };
};
export declare const command = "onto [branch]";
export declare const canonical = "upstack onto";
export declare const aliases: string[];
export declare const description = "Rebase the current branch onto the latest commit of the target branch and restack all of its descendants. If no branch is passed in, opens an interactive selector.";
export declare const builder: {
    readonly branch: {
        readonly describe: "Optional branch to rebase the current stack onto.";
        readonly demandOption: false;
        readonly positional: true;
        readonly hidden: true;
        readonly type: "string";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
