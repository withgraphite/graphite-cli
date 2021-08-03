// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import { request } from "@screenplaydev/retyped-routes";
import chalk from "chalk";
import { execSync } from "child_process";
import fetch from "node-fetch";
import yargs from "yargs";
import { version } from "../../../package.json";
import { init } from "../../actions/init";
import { API_SERVER } from "../api";
import { repoConfig } from "../config";
import {
  ConfigError,
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
  ValidationFailedError,
} from "../errors";
import { logError, logInfo, logWarn, parseArgs } from "../utils";
import { getNumBranches, getNumCommitObjects } from "./context";
import tracer from "./tracer";

export async function checkForUpgrade(): Promise<void> {
  return tracer.span(
    { name: "function", resource: "checkForUpgrade" },
    async () => {
      if (!shouldReportTelemetry()) {
        return;
      }
      try {
        const user = userEmail();
        const response = await fetch(
          `https://api.graphite.dev/v1/graphite/upgrade?${[
            ...(user ? [`user=${user}`] : []),
            `currentVersion=${version}`,
          ].join("&")}`,
          { method: "GET" }
        );
        const formatMessage = (message: string): string => {
          return ["-".repeat(20), message, "-".repeat(20), "\n"].join("\n");
        };
        if (response.status == 200) {
          const body = await response.json();
          const prompt = body.prompt as
            | { message: string; blocking: boolean }
            | undefined;
          if (prompt) {
            if (!prompt.blocking) {
              console.log(chalk.yellow(formatMessage(prompt.message)));
            } else {
              console.log(chalk.redBright(formatMessage(prompt.message)));
              // eslint-disable-next-line no-restricted-syntax
              process.exit(1);
            }
          }
        }
      } catch (err) {
        return;
      }
    }
  );
}
export function shouldReportTelemetry(): boolean {
  return process.env.NODE_ENV != "development";
}

export function userEmail(): string | undefined {
  try {
    return execSync("git config user.email").toString().trim();
  } catch (err) {
    return undefined;
  }
}

async function logCommand(
  commandName: string,
  durationMiliSeconds: number,
  err?: Error
): Promise<void> {
  if (shouldReportTelemetry()) {
    try {
      await Promise.all([
        request.requestWithArgs(API_SERVER, graphiteCLIRoutes.logCommand, {
          commandName: commandName,
          durationMiliSeconds: durationMiliSeconds,
          user: userEmail() || "NotFound",
          version: version,
          err: err
            ? {
                name: err.name,
                message: err.message,
                stackTrace: err.stack || "",
                debugContext: undefined,
              }
            : undefined,
        }),
        tracer.flush(),
      ]);
    } catch {
      // dont log err
    }
  }
}

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
          user: userEmail() || "NotFound",
          version: version,
          args: parsedArgs.args,
          alias: parsedArgs.alias,
          ...(numCommits ? { commits: numCommits.toString() } : {}),
          ...(numBranches ? { branches: numBranches.toString() } : {}),
        },
      },
      async () => {
        await checkForUpgrade();
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
          } else if (err instanceof ConfigError) {
            logError(`Bad Config: ${err.message}`);
          }
          throw err;
        }
      }
    );
  } catch (err) {
    const end = Date.now();
    await Promise.all([logCommand(parsedArgs.command, end - start, err)]);
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }

  const end = Date.now();
  void logCommand(parsedArgs.command, end - start);
}
