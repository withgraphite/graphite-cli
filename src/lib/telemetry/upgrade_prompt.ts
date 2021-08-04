#!/usr/bin/env node
import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import { request } from "@screenplaydev/retyped-routes";
import chalk from "chalk";
import cp from "child_process";
import { getUserEmail, SHOULD_REPORT_TELEMETRY } from ".";
import { version } from "../../../package.json";
import { API_SERVER } from "../api";
import { userConfig } from "../config";
import { firstSemverIsNewer } from "../utils";

function printAndClearOldMessage(): void {
  const oldMessage = userConfig.getMessage();
  // "Since we fetch the message asynchronously and display it when the user runs their next Graphite command,
  // double-check before showing the message if the CLI is still an old version
  // (i.e. the user hasn't updated the CLI in the meantime)."
  if (oldMessage && !firstSemverIsNewer(version, oldMessage.cliVersion)) {
    console.log(chalk.yellow(oldMessage) + "\n\n");
    userConfig.setMessage(undefined);
  }
}
export function fetchUpgradePromptInBackground(): void {
  printAndClearOldMessage();
  cp.spawn("/usr/bin/env", ["node", __filename], {
    detached: true,
    stdio: "ignore",
  });
}

async function fetchUpgradePrompt(): Promise<void> {
  if (!SHOULD_REPORT_TELEMETRY) {
    return;
  }
  try {
    const user = getUserEmail();
    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.upgradePrompt,
      {},
      {
        user: user || "NotFound",
        currentVersion: version,
      }
    );

    if (response._response.status == 200) {
      if (response.prompt) {
        userConfig.setMessage({
          contents: response.prompt.message,
          cliVersion: version,
        });
      } else {
        userConfig.setMessage(undefined);
      }
    }
  } catch (err) {
    return;
  }
}

if (process.argv[1] === __filename) {
  void fetchUpgradePrompt();
}
