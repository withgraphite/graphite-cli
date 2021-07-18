import yargs from "yargs";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";
declare const args: {
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly onto: {
        readonly describe: "A branch to restack the current stack onto";
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class RestackCommand extends AbstractCommand<typeof args> {
    static args: {
        readonly silent: {
            readonly describe: "silence output from the command";
            readonly demandOption: false;
            readonly default: false;
            readonly type: "boolean";
            readonly alias: "s";
        };
        readonly onto: {
            readonly describe: "A branch to restack the current stack onto";
            readonly demandOption: false;
            readonly optional: true;
            readonly type: "string";
        };
    };
    _execute(argv: argsT): Promise<void>;
}
export declare function restackBranch(currentBranch: Branch, oldBranchHead: string, opts: argsT): Promise<void>;
export {};
