declare type ExecStateConfigT = {
    outputDebugLogs?: boolean;
    quiet?: boolean;
    noVerify?: boolean;
    interactive?: boolean;
};
/**
 * An in-memory object that configures global settings for the current
 * invocation of the Graphite CLI.
 */
declare class ExecStateConfig {
    _data: ExecStateConfigT;
    constructor();
    setOutputDebugLogs(outputDebugLogs: boolean): this;
    outputDebugLogs(): boolean;
    setQuiet(quiet: boolean): this;
    quiet(): boolean;
    setNoVerify(noVerify: boolean): this;
    noVerify(): boolean;
    setInteractive(interactive: boolean): this;
    interactive(): boolean;
}
export declare const execStateConfig: ExecStateConfig;
export {};
