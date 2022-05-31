import yargs from 'yargs';
export declare const globalArgumentsOptions: {
    readonly interactive: {
        readonly alias: "i";
        readonly default: true;
        readonly type: "boolean";
        readonly demandOption: false;
    };
    readonly quiet: {
        readonly alias: "q";
        readonly default: false;
        readonly type: "boolean";
        readonly demandOption: false;
    };
    readonly verify: {
        readonly default: true;
        readonly type: "boolean";
        readonly demandOption: false;
    };
    readonly debug: {
        readonly default: false;
        readonly type: "boolean";
        readonly demandOption: false;
    };
};
export declare type TGlobalArguments = yargs.Arguments<yargs.InferredOptionTypes<typeof globalArgumentsOptions>>;
