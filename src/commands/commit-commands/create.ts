import yargs from 'yargs';
import { commitCreateAction } from '../../actions/commit_create';
import { graphite } from '../../lib/runner';

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
export const description = 'Create a new commit and restack upstack branches.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) =>
    commitCreateAction(
      {
        message: argv.message,
        addAll: argv.all,
      },
      context
    )
  );
};
