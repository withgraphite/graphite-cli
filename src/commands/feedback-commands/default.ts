import { request } from '@screenplaydev/retyped-routes';
import chalk from 'chalk';
import graphiteCLIRoutes from 'graphite-cli-routes';
import yargs from 'yargs';
import { API_SERVER } from '../../lib/api';
import { captureState } from '../../lib/debug-context';
import { ExitFailedError } from '../../lib/errors';
import { getUserEmail, profile } from '../../lib/telemetry';

const args = {
  message: {
    type: 'string',
    positional: true,
    demandOption: true,
    describe:
      'Positive or constructive feedback for the Graphite team! Jokes are chill too.',
  },
  'with-debug-context': {
    type: 'boolean',
    default: false,
    describe:
      "Include a blob of json describing your repo's state to help with debugging. Run 'gt feedback debug-context' to see what would be included.",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = '* <message>';
export const canonical = 'feedback';
export const description =
  "Post a string directly to the maintainers' Slack where they can factor in your feedback, laugh at your jokes, cry at your insults, or test the bounds of Slack injection attacks.";
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    const user = getUserEmail();
    if (!argv.message) {
      return;
    }
    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.feedback,
      {
        user: user || 'NotFound',
        message: argv.message,
        debugContext: argv['with-debug-context'] ? captureState() : undefined,
      }
    );
    if (response._response.status == 200) {
      console.log(
        chalk.green(
          `Feedback received loud and clear (in a team Slack channel) :)`
        )
      );
    } else {
      throw new ExitFailedError(
        `Failed to report feedback, network response ${response.status}`
      );
    }
  });
};
