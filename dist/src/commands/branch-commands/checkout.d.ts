import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly describe: "Optional branch to checkout";
        readonly demandOption: false;
        readonly type: "string";
        readonly positional: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "checkout [branch]";
export declare const canonical = "branch checkout";
export declare const description = "Checkout a branch in a stack";
export declare const aliases: string[];
export declare const builder: {
    readonly branch: {
        readonly describe: "Optional branch to checkout";
        readonly demandOption: false;
        readonly type: "string";
        readonly positional: true;
    };
};
export declare const handler: (args: argsT) => Promise<void>;
export {};
