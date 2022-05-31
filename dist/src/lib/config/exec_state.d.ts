import { TGlobalArguments } from '../global_arguments';
declare type TExecState = {
    outputDebugLogs: boolean;
    quiet: boolean;
    noVerify: boolean;
    interactive: boolean;
};
export declare function composeExecState(globalArguments?: TGlobalArguments): TExecState;
export {};
