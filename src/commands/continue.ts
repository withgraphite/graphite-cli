import yargs from 'yargs';
import { continueRestack } from '../actions/restack';
import { profile } from '../lib/telemetry/profile';

const args = {
  all: {
    describe: `Stage all changes before continuing.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'a',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'continue';
export const canonical = 'continue';
export const aliases = [];
export const description =
  'Continues the most-recent Graphite command halted by a merge conflict.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) =>
    continueRestack({ addAll: argv.all }, context)
  );
