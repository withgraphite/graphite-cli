import { TContext } from '../context';
import { TCacheLock } from '../engine/cache_lock';
import { KilledError } from '../errors';
import { postTelemetryInBackground } from './post_traces';
import { tracer } from './tracer';

export function registerSigintHandler(opts: {
  commandName: string;
  canonicalCommandName: string;
  startTime: number;
  cacheLock: TCacheLock;
}): { attachContext: (context: TContext) => void } {
  const contextRef: { context?: TContext } = { context: undefined };

  process.on('SIGINT', () => {
    opts.cacheLock.release();
    const err = new KilledError();
    // End all current traces abruptly.
    tracer.allSpans.forEach((s) => s.end(err));
    postTelemetryInBackground({
      commandName: opts.commandName,
      canonicalCommandName: opts.canonicalCommandName,
      durationMiliSeconds: Date.now() - opts.startTime,
      err,
    });
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  });

  return {
    attachContext: (context: TContext) => (contextRef.context = context),
  };
}
