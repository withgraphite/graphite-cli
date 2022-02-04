import Branch from '../../wrapper-classes/branch';
import { MergeConflictCallstackT } from '../config/merge_conflict_callstack_config';
declare class ExitError extends Error {
}
declare class ExitCancelledError extends ExitError {
    constructor(message: string);
}
declare class ExitFailedError extends ExitError {
    constructor(message: string, err?: Error);
}
declare class RebaseConflictError extends ExitError {
    constructor(message: string, callstack: MergeConflictCallstackT);
}
declare class ValidationFailedError extends ExitError {
    constructor(message: string);
}
declare class PreconditionsFailedError extends ExitError {
    constructor(message: string);
}
declare class ConfigError extends ExitError {
    constructor(message: string);
}
declare class KilledError extends ExitError {
    constructor();
}
declare class SiblingBranchError extends ExitError {
    constructor(branches: Branch[]);
}
declare class MultiParentError extends ExitError {
    constructor(branch: Branch, parents: Branch[]);
}
export { ExitError, ExitFailedError, PreconditionsFailedError, RebaseConflictError, ValidationFailedError, ConfigError, ExitCancelledError, SiblingBranchError, MultiParentError, KilledError, };
