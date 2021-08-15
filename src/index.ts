#!/usr/bin/env node
import chalk from "chalk";
import tmp from "tmp";
import yargs from "yargs";
import {
  globalArgumentsOptions,
  processGlobalArgumentsMiddleware,
} from "./lib/global-arguments";
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

function deprecatedGpWarning(argv: yargs.Arguments) {
  if (argv["$0"] == "gp") {
    console.log(
      chalk.yellow(
        `Warning: Based on feedback, we've update the Graphite CLI name to "gt". The name "gp" has been deprecated.`
      )
    );
  }
}

yargs
  .commandDir("commands")
  .help()
  .middleware(deprecatedGpWarning)
  .usage(
    [
      "Graphite is a command line tool that makes working with stacked changes fast & intuitive.",
    ].join("\n")
  )
  .options(globalArgumentsOptions)
  .middleware(processGlobalArgumentsMiddleware)
  .strict()
  .demandCommand().argv;
