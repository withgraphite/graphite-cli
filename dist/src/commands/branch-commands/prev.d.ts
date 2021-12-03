import yargs from "yargs";
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
export declare const command = "prev [steps]";
export declare const canonical = "branch prev";
export declare const aliases: string[];
export declare const description = "If you're in a stack: Branch A \u2192 Branch B (you are here) \u2192 Branch C, checkout the branch directly downstack (Branch A). Pass the `steps` arg to checkout the branch `[steps]` levels below in the stack.";
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
