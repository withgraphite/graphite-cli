"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KilledError = exports.BadTrunkOperationError = exports.UntrackedBranchError = exports.ConcurrentExecutionError = exports.PreconditionsFailedError = exports.RebaseConflictError = exports.CommandFailedError = exports.ExitFailedError = void 0;
class ExitError extends Error {
}
class ExitFailedError extends ExitError {
    constructor(message, err) {
        err
            ? super([
                message,
                err
                    .toString()
                    .trim()
                    .split('\n')
                    .map((line) => `> ${line}`)
                    .join('\n'),
            ].join('\n'))
            : super(message);
        this.name = 'ExitFailed';
    }
}
exports.ExitFailedError = ExitFailedError;
class CommandFailedError extends ExitError {
    constructor(command, stdout, stderr) {
        super(`Command failed (${command}):\n${stdout}\n${stderr}`);
        this.name = 'CommandFailed';
    }
}
exports.CommandFailedError = CommandFailedError;
class RebaseConflictError extends ExitError {
    constructor() {
        super(`Hit a conflict during rebase.`);
        this.name = 'RebaseConflict';
    }
}
exports.RebaseConflictError = RebaseConflictError;
class PreconditionsFailedError extends ExitError {
    constructor(message) {
        super(message);
        this.name = 'PreconditionsFailed';
    }
}
exports.PreconditionsFailedError = PreconditionsFailedError;
class ConcurrentExecutionError extends ExitError {
    constructor() {
        super(`Cannot run more than one Graphite process at once.`);
        this.name = 'ConcurrentExecutionError';
    }
}
exports.ConcurrentExecutionError = ConcurrentExecutionError;
class UntrackedBranchError extends ExitError {
    constructor() {
        super(`Cannot perform this operation on an untracked branch.`);
        this.name = 'UntrackedBranchError';
    }
}
exports.UntrackedBranchError = UntrackedBranchError;
class BadTrunkOperationError extends ExitError {
    constructor() {
        super(`Cannot perform this operation on the trunk branch.`);
        this.name = 'BadTrunkOperationError';
    }
}
exports.BadTrunkOperationError = BadTrunkOperationError;
class KilledError extends ExitError {
    constructor() {
        super(`Killed Graphite early.`);
        this.name = 'Killed';
    }
}
exports.KilledError = KilledError;
//# sourceMappingURL=errors.js.map