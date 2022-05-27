import {
  persistMergeConflictCallstack,
  TMergeConflictCallstack,
} from './config/merge_conflict_callstack_config';
import { TContext } from './context';

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
  constructor(
    message: string,
    callstack?: TMergeConflictCallstack,
    context?: TContext
  ) {
    super(message);
    this.name = 'RebaseConflict';

    // TODO kill this after migrating to restack
    if (callstack && context) {
      persistMergeConflictCallstack(callstack, context);
    }
  }
}

export class PreconditionsFailedError extends ExitError {
  constructor(message: string) {
    super(message);
    this.name = 'PreconditionsFailed';
  }
}

export class KilledError extends ExitError {
  constructor() {
    super(`User killed Graphite early`);
    this.name = 'Killed';
  }
}
