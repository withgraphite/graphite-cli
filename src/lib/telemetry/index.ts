// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import { request } from "@screenplaydev/retyped-routes";
import chalk from "chalk";
import { execSync } from "child_process";
import fetch from "node-fetch";
import { version } from "../../../package.json";
import { API_SERVER } from "../api";
import {
  ExitFailedError,
  PreconditionsFailedError,
  RebaseConflictError,
} from "../errors";
import { logError, logInfo } from "../utils";

export async function profiledHandler(
  name: string,
  handler: () => Promise<void>
): Promise<void> {
  await checkForUpgrade();
  await profile(name, async () => {
    await handler();
  });
}

export async function checkForUpgrade(): Promise<void> {
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
    await request.requestWithArgs(API_SERVER, graphiteCLIRoutes.logCommand, {
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
    });
  }
}

export async function profile(
  command: string,
  handler: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await handler();
  } catch (err) {
    const end = Date.now();
    await logCommand(command, end - start, err);
    if (err instanceof ExitFailedError) {
      logError(err.message);
    } else if (err instanceof PreconditionsFailedError) {
      logInfo(err.message);
    }
    if (err instanceof RebaseConflictError) {
      // eslint-disable-next-line no-restricted-syntax
      process.exit(0);
    }
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }
  const end = Date.now();
  void logCommand(command, end - start);
}
