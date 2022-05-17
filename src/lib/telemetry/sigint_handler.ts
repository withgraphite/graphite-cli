import { KilledError } from '../errors';
import { postTelemetryInBackground } from './post_traces';
import { tracer } from './tracer';

export function registerSigintHandler(opts: {
  commandName: string;
  canonicalCommandName: string;
  startTime: number;
}): void {
  process.on('SIGINT', () => {
    console.log(`Gracefully terminating...`);
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
    process.exit(0);
  });
}
