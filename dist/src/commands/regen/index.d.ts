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
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class RegenCommand extends AbstractCommand<typeof args> {
    static args: {
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
