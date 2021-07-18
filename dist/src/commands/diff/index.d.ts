import yargs from "yargs";
import AbstractCommand from "../abstract_command";
declare const args: {
    readonly "branch-name": {
        readonly type: "string";
        readonly alias: "b";
        readonly describe: "The name of the target which builds your app for release";
    };
    readonly message: {
        readonly type: "string";
        readonly alias: "m";
        readonly describe: "The message for the new commit";
    };
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class DiffCommand extends AbstractCommand<typeof args> {
    static args: {
        readonly "branch-name": {
            readonly type: "string";
            readonly alias: "b";
            readonly describe: "The name of the target which builds your app for release";
        };
        readonly message: {
            readonly type: "string";
            readonly alias: "m";
            readonly describe: "The message for the new commit";
        };
        readonly silent: {
            readonly describe: "silence output from the command";
            readonly demandOption: false;
            readonly default: false;
            readonly type: "boolean";
            readonly alias: "s";
        };
    };
    _execute(argv: argsT): Promise<void>;
}
export {};
