import yargs from 'yargs';
import { userConfig } from '../lib/config';
import { profile } from '../lib/telemetry';
import { logInfo, logSuccess } from '../lib/utils';

const args = {
  token: {
    type: 'string',
    alias: 't',
    describe: 'Auth token.',
    demandOption: false,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'auth';
export const description =
  'Add your auth token to enable Graphite CLI to create and update your PRs on GitHub. You can get your auth token here: https://app.graphite.dev/activate.';
export const builder = args;
export const canonical = 'auth';

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    if (argv.token) {
      userConfig.setAuthToken(argv.token);
      logSuccess(`🔐 Saved auth token to "${userConfig.path()}"`);
      return;
    }
    logInfo(userConfig.getAuthToken() ?? 'No auth token set.');
  });
};
