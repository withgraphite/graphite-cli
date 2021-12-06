import yargs from 'yargs';
import { commitCreateAction } from '../../actions/commit_create';
import { profile } from '../../lib/telemetry';

const args = {
  all: {
    describe: `Stage all changes before committing.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'a',
  },
  message: {
    type: 'string',
    alias: 'm',
    describe: 'The message for the new commit.',
    required: false,
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'create';
export const canonical = 'commit create';
export const aliases = ['c'];
export const description = 'Create a new commit and fix upstack branches.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    await commitCreateAction({
      message: argv.message,
      addAll: argv.all,
    });
  });
};
