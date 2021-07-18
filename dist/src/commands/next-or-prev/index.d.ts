#!/usr/bin/env node
import yargs from "yargs";
import AbstractCommand from "../abstract_command";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare class NextCommand extends AbstractCommand<typeof args> {
    static args: {};
    _execute(argv: argsT): Promise<void>;
}
export declare class PrevCommand extends AbstractCommand<typeof args> {
    static args: {};
    _execute(argv: argsT): Promise<void>;
}
export {};
