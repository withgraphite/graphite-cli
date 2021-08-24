import { Branch } from "../../wrapper-classes";
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

class KilledError extends ExitError {
  constructor() {
    super(`User killed Graphite early`);
    this.name = "Killed";
  }
}

class SiblingBranchError extends ExitError {
  constructor(branches: Branch[]) {
    super(
      [
        `Multiple branches pointing to commit ${branches[0].ref()}.`,
        `Graphite cannot infer parent-child relationships between identical branches.`,
        `Please add a commit to one, or delete one to continue:`,
        ...branches.map((b) => `-> (${b.name})`),
      ].join("\n")
    );
    this.name = `SiblingBranchError`;
  }
}

class MultiParentError extends ExitError {
  constructor(branch: Branch, parents: Branch[]) {
    super(
      [
        `Multiple git commit parents detected for ${branch.name}.`,
        `Graphite does not support multi-parent branches in stacks.`,
        `Please adjust the git commit tree or delete one of the parents:`,
        ...parents.map((b) => `-> (${b.name})`),
      ].join("\n")
    );
    this.name = `ParentBranchError`;
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
  SiblingBranchError,
  MultiParentError,
  KilledError,
};
