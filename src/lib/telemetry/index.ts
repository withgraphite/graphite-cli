// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import { execSync } from "child_process";
import fetch from "node-fetch";

function shouldReportTelemetry(): boolean {
  return process.env.NODE_ENV != "development";
}

export function userEmail(): string | undefined {
  try {
    return execSync("git config user.email").toString().trim();
  } catch (err) {
    return undefined;
  }
}

export async function logCommand(
  commandName: string,
  durationMiliSeconds: number,
  err?: Error
): Promise<void> {
  if (shouldReportTelemetry()) {
    await fetch("https://api.graphite.dev/v1/graphite/log-command", {
      method: "POST",
      body: JSON.stringify({
        commandName: commandName,
        durationMiliSeconds: durationMiliSeconds,
        user: userEmail() || "NotFound",
        err: err
          ? {
              name: err.name,
              message: err.message,
              stackTrace: err.stack || "",
              debugContext: undefined,
            }
          : undefined,
      }),
    });
  }
}

export async function profile<T>(
  command: string,
  handler: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await handler();
  } catch (err) {
    const end = Date.now();
    await logCommand(command, end - start, err);
    throw err;
  }
  const end = Date.now();
  void logCommand(command, end - start);
}
