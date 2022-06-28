import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { version } from '../../package.json';
import { API_SERVER } from '../lib/api/server';
import {
  messageConfigFactory,
  TMessageConfig,
} from '../lib/config/message_config';
import { TContextLite } from '../lib/context';
import { getUserEmail } from '../lib/git/get_email';
import { spawnDetached } from '../lib/utils/spawn';
import { SHOULD_REPORT_TELEMETRY } from './post_traces';

function printAndClearOldMessage(context: TContextLite): void {
  const oldMessage = context.messageConfig.data.message;
  // "Since we fetch the message asynchronously and display it when the user runs their next Graphite command,
  // double-check before showing the message if the CLI is still an old version
  // (i.e. the user hasn't updated the CLI in the meantime)."
  if (oldMessage && version == oldMessage.cliVersion) {
    context.splog.message(oldMessage.contents);
    context.messageConfig.update((data) => (data.message = undefined));
  }
}
export function fetchUpgradePromptInBackground(context: TContextLite): void {
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
      API_ROUTES.upgradePrompt,
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
