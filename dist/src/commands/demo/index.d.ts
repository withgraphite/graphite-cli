import yargs from "yargs";
import AbstractCommand from "../abstract_command";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class DemoCommand extends AbstractCommand<typeof args> {
    static args: {};
    _execute(argv: argsT): Promise<void>;
}
export {};
