import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { version } from '../../../package.json';
import { API_SERVER } from '../api';
import { TContext } from '../context';
import { spawnDetached } from '../utils/spawn';
import { logMessageFromGraphite } from '../utils/splog';
import {
  messageConfigFactory,
  TMessageConfig,
} from './../config/message_config';
import { getUserEmail } from './context';
import { SHOULD_REPORT_TELEMETRY } from './post_traces';

function printAndClearOldMessage(context: TContext): void {
  const oldMessage = context.messageConfig.data.message;
  // "Since we fetch the message asynchronously and display it when the user runs their next Graphite command,
  // double-check before showing the message if the CLI is still an old version
  // (i.e. the user hasn't updated the CLI in the meantime)."
  if (oldMessage && version == oldMessage.cliVersion) {
    logMessageFromGraphite(oldMessage.contents);
    context.messageConfig.update((data) => (data.message = undefined));
  }
}
export function fetchUpgradePromptInBackground(context: TContext): void {
  if (!context.repoConfig.graphiteInitialized()) {
    return;
  }

  printAndClearOldMessage(context);
  spawnDetached(__filename);
}

async function fetchUpgradePrompt(
  messageConfig: TMessageConfig
): Promise<void> {
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
        const message = response.prompt.message;
        messageConfig.update(
          (data) =>
            (data.message = {
              contents: message,
              cliVersion: version,
            })
        );
      } else {
        messageConfig.update((data) => (data.message = undefined));
      }
    }
  } catch (err) {
    return;
  }
}

if (process.argv[1] === __filename) {
  void fetchUpgradePrompt(messageConfigFactory.load());
}
