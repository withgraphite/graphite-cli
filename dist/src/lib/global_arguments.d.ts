import yargs from 'yargs';
export declare const globalArgumentsOptions: {
    readonly interactive: {
        readonly default: true;
        readonly type: "boolean";
        readonly demandOption: false;
        readonly description: "Prompt the user. Disable with --no-interactive.";
    };
    readonly quiet: {
        readonly alias: "q";
        readonly default: false;
        readonly type: "boolean";
        readonly demandOption: false;
        readonly description: "Minimize output to the terminal.";
    };
    readonly verify: {
        readonly default: true;
        readonly type: "boolean";
        readonly demandOption: false;
        readonly description: "Run git hooks. Disable with --no-verify.";
    };
    readonly debug: {
        readonly default: false;
        readonly type: "boolean";
        readonly demandOption: false;
        readonly description: "Display debug output.";
    };
};
export declare type TGlobalArguments = Partial<yargs.InferredOptionTypes<typeof globalArgumentsOptions>>;
