#!/usr/bin/env node
import { request } from '@screenplaydev/retyped-routes';
import cp from 'child_process';
import graphiteCLIRoutes from 'graphite-cli-routes';
import { getUserEmail, SHOULD_REPORT_TELEMETRY } from '.';
import { version } from '../../../package.json';
import { API_SERVER } from '../api';
import { messageConfig, repoConfig } from '../config';
import { logMessageFromGraphite } from '../utils';

function printAndClearOldMessage(): void {
  const oldMessage = messageConfig.getMessage();
  // "Since we fetch the message asynchronously and display it when the user runs their next Graphite command,
  // double-check before showing the message if the CLI is still an old version
  // (i.e. the user hasn't updated the CLI in the meantime)."
  if (oldMessage && version == oldMessage.cliVersion) {
    logMessageFromGraphite(oldMessage.contents);
    messageConfig.setMessage(undefined);
  }
}
export function fetchUpgradePromptInBackground(): void {
  if (!repoConfig.graphiteInitialized()) {
    return;
  }

  printAndClearOldMessage();
  cp.spawn('/usr/bin/env', ['node', __filename], {
    detached: true,
    stdio: 'ignore',
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
        user: user || 'NotFound',
        currentVersion: version,
      }
    );

    if (response._response.status == 200) {
      if (response.prompt) {
        messageConfig.setMessage({
          contents: response.prompt.message,
          cliVersion: version,
        });
      } else {
        messageConfig.setMessage(undefined);
      }
    }
  } catch (err) {
    return;
  }
}

if (process.argv[1] === __filename) {
  void fetchUpgradePrompt();
}
