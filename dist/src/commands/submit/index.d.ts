import yargs from "yargs";
import AbstractCommand from "../abstract_command";
declare const args: {
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly "from-commits": {
        readonly describe: "The name of the target which builds your app for release";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly default: false;
    };
    readonly fill: {
        readonly describe: "Do not prompt for title/body and just use commit info";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "f";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class SubmitCommand extends AbstractCommand<typeof args> {
    static args: {
        readonly silent: {
            readonly describe: "silence output from the command";
            readonly demandOption: false;
            readonly default: false;
            readonly type: "boolean";
            readonly alias: "s";
        };
        readonly "from-commits": {
            readonly describe: "The name of the target which builds your app for release";
            readonly demandOption: false;
            readonly type: "boolean";
            readonly default: false;
        };
        readonly fill: {
            readonly describe: "Do not prompt for title/body and just use commit info";
            readonly demandOption: false;
            readonly type: "boolean";
            readonly default: false;
            readonly alias: "f";
        };
    };
    _execute(argv: argsT): Promise<void>;
}
export {};
