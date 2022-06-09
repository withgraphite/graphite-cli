class ExitError extends Error {}

export class ExitFailedError extends ExitError {
  constructor(message: string, err?: Error) {
    err
      ? super(
          [
            message,
            err
              .toString()
              .trim()
              .split('\n')
              .map((line) => `> ${line}`)
              .join('\n'),
          ].join('\n')
        )
      : super(message);
    this.name = 'ExitFailed';
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
