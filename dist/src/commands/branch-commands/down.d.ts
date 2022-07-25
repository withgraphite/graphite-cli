import yargs from 'yargs';
declare const args: {
    readonly steps: {
        readonly describe: "The number of levels to traverse downstack.";
        readonly demandOption: false;
        readonly default: 1;
        readonly type: "number";
        readonly alias: "n";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "down [steps]";
export declare const canonical = "branch down";
export declare const aliases: string[];
export declare const description = "Switch to the parent of the current branch.";
export declare const builder: {
    readonly steps: {
        readonly describe: "The number of levels to traverse downstack.";
        readonly demandOption: false;
        readonly default: 1;
        readonly type: "number";
        readonly alias: "n";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
