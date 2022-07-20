class ExitError extends Error {}

export class ExitFailedError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = 'ExitFailed';
  }
}

export class CommandFailedError extends ExitError {
  constructor(command: string, stdout: string, stderr: string) {
    super(`Command failed (${command}):\n${stdout}\n${stderr}`);
    this.name = 'CommandFailed';
  }
}

export class RebaseConflictError extends ExitError {
  constructor() {
    super(`Hit a conflict during rebase.`);
    this.name = 'RebaseConflict';
  }
}

export class PreconditionsFailedError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = 'PreconditionsFailed';
  }
}

export class ConcurrentExecutionError extends ExitError {
  constructor() {
    super(`Cannot run more than one Graphite process at once.`);
    this.name = 'ConcurrentExecutionError';
  }
}

export class UntrackedBranchError extends ExitError {
  constructor() {
    super(`Cannot perform this operation on an untracked branch.`);
    this.name = 'UntrackedBranchError';
  }
}

export class BadTrunkOperationError extends ExitError {
  constructor() {
    super(`Cannot perform this operation on the trunk branch.`);
    this.name = 'BadTrunkOperationError';
  }
}

export class KilledError extends ExitError {
  constructor() {
    super(`Killed Graphite early.`);
    this.name = 'Killed';
  }
}
