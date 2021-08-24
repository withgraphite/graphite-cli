import { postTelemetryInBackground, tracer } from ".";
import { KilledError } from "../errors";

export function registerSigintHandler(opts: {
  commandName: string;
  startTime: number;
}): void {
  process.on("SIGINT", () => {
    console.log(`Gracefully terminating...`);
    const err = new KilledError();
    // End all current traces abruptly.
    tracer.allSpans.forEach((s) => s.end(err));
    postTelemetryInBackground({
      commandName: opts.commandName,
      durationMiliSeconds: Date.now() - opts.startTime,
      err: {
        errName: err.name,
        errMessage: err.message,
        errStack: err.stack || "",
      },
    });
    // eslint-disable-next-line no-restricted-syntax
    process.exit(0);
  });
}
