class ExitError extends Error {}

class ExitCancelledError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = "ExitCancelled";
  }
}

class ExitFailedError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = "ExitFailed";
  }
}

class RebaseConflictError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = "RebaseConflict";
  }
}

class ValidationFailedError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationFailed";
  }
}

class PreconditionsFailedError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = "PreconditionsFailed";
  }
}

class ConfigError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = "Config";
  }
}

export {
  ExitError,
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
  ValidationFailedError,
  ConfigError,
  ExitCancelledError,
};
