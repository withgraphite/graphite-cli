// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import yargs from "yargs";
import { postTelemetryInBackground } from ".";
import { version } from "../../../package.json";
import { init } from "../../actions/init";
import { repoConfig } from "../config";
import {
  ConfigError,
  ExitCancelledError,
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
  ValidationFailedError,
} from "../errors";
import {
  logError,
  logInfo,
  logWarn,
  parseArgs,
  VALIDATION_HELPER_MESSAGE,
} from "../utils";
import { getNumBranches, getNumCommitObjects, getUserEmail } from "./context";
import tracer from "./tracer";

export async function profile(
  args: yargs.Arguments,
  handler: () => Promise<void>
): Promise<void> {
  // Self heal repo config on all commands besides init:
  const parsedArgs = parseArgs(args);
  if (parsedArgs.command !== "repo init" && !repoConfig.getTrunk()) {
    logInfo(
      `No trunk branch specified in "${repoConfig.path()}", please choose now.`
    );
    await init();
  }

  const start = Date.now();
  const numCommits = getNumCommitObjects();
  const numBranches = getNumBranches();

  try {
    await tracer.span(
      {
        name: "command",
        resource: parsedArgs.command,
        meta: {
          user: getUserEmail() || "NotFound",
          version: version,
          args: parsedArgs.args,
          alias: parsedArgs.alias,
          ...(numCommits ? { commits: numCommits.toString() } : {}),
          ...(numBranches ? { branches: numBranches.toString() } : {}),
        },
      },
      async () => {
        try {
          await handler();
        } catch (err) {
          if (err instanceof ExitFailedError) {
            logError(err.message);
          } else if (err instanceof PreconditionsFailedError) {
            logInfo(err.message);
          } else if (err instanceof RebaseConflictError) {
            logWarn(`Rebase conflict: ${err.message}`);
            return; // Dont throw error here.
          } else if (err instanceof ValidationFailedError) {
            logError(`Validation: ${err.message}`);
            logInfo(VALIDATION_HELPER_MESSAGE);
          } else if (err instanceof ConfigError) {
            logError(`Bad Config: ${err.message}`);
          } else if (err instanceof ExitCancelledError) {
            logWarn(`Cancelled: ${err.message}`);
            return; // Dont throw error here.
          }
          throw err;
        }
      }
    );
  } catch (err) {
    const end = Date.now();
    postTelemetryInBackground({
      commandName: parsedArgs.command,
      durationMiliSeconds: end - start,
      err: {
        errName: err.name,
        errMessage: err.message,
        errStack: err.stack || "",
      },
    });
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }

  const end = Date.now();
  postTelemetryInBackground({
    commandName: parsedArgs.command,
    durationMiliSeconds: end - start,
  });
}
