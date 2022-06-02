import yargs from 'yargs';
import { logAction } from '../../actions/log';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;

export const command = '*';
export const description = 'Log all stacks tracked by Graphite.';
export const builder = args;
export const canonical = 'log';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) => logAction('FULL', context));
