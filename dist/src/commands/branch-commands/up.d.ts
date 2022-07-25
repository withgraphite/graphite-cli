import yargs from 'yargs';
declare const args: {
    readonly steps: {
        readonly describe: "The number of levels to traverse upstack.";
        readonly demandOption: false;
        readonly default: 1;
        readonly type: "number";
        readonly alias: "n";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "up [steps]";
export declare const canonical = "branch up";
export declare const aliases: string[];
export declare const description = "Switch to the child of the current branch. Prompts if ambiguous.";
export declare const builder: {
    readonly steps: {
        readonly describe: "The number of levels to traverse upstack.";
        readonly demandOption: false;
        readonly default: 1;
        readonly type: "number";
        readonly alias: "n";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
