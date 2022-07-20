declare class ExitError extends Error {
}
export declare class ExitFailedError extends ExitError {
    constructor(message: string, err?: Error);
}
export declare class CommandFailedError extends ExitError {
    constructor(command: string, stdout: string, stderr: string);
}
export declare class RebaseConflictError extends ExitError {
    constructor();
}
export declare class PreconditionsFailedError extends ExitError {
    constructor(message: string);
}
export declare class ConcurrentExecutionError extends ExitError {
    constructor();
}
export declare class UntrackedBranchError extends ExitError {
    constructor();
}
export declare class BadTrunkOperationError extends ExitError {
    constructor();
}
export declare class KilledError extends ExitError {
    constructor();
}
export {};
