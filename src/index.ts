#!/usr/bin/env node
import tmp from "tmp";
import yargs from "yargs";
import {
  fetchUpgradePromptInBackground,
  postTelemetryInBackground,
} from "./lib/telemetry";
import { logError } from "./lib/utils";

fetchUpgradePromptInBackground();
// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

process.on("uncaughtException", (err) => {
  postTelemetryInBackground({
    commandName: "unknown",
    durationMiliSeconds: 0,
    err: {
      errName: err.name,
      errMessage: err.message,
      errStack: err.stack || "",
    },
  });
  logError(err.message);
  // eslint-disable-next-line no-restricted-syntax
  process.exit(1);
});

yargs
  .commandDir("commands")
  .help()
  .usage(["This CLI helps you manage stacked diffs."].join("\n"))
  .strict()
  .demandCommand().argv;
