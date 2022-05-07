import open from 'open';
import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;

export const command = '*';
export const description = 'Opens your Graphite dashboard in the web.';
export const builder = args;
export const canonical = 'dash';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

const DASHBOARD_URL = 'https://app.graphite.dev/';

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    void open(DASHBOARD_URL);
  });
};
