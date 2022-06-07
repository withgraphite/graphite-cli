import yargs from 'yargs';
import { commitAmendAction } from '../../actions/commit_amend';
import { profile } from '../../lib/telemetry/profile';

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
    describe: 'The updated message for the commit.',
    demandOption: false,
  },
  edit: {
    type: 'boolean',
    describe: 'Modify the existing commit message.',
    demandOption: false,
    default: true,
  },
  'no-edit': {
    type: 'boolean',
    describe:
      "Don't modify the existing commit message. Takes precedence over --edit",
    demandOption: false,
    default: false,
    alias: 'n',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'amend';
export const canonical = 'commit amend';
export const aliases = ['a'];
export const description =
  'Amend the most recent commit and fix upstack branches.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) =>
    commitAmendAction(
      {
        message: argv.message,
        noEdit: argv['no-edit'] || !argv.edit,
        addAll: argv.all,
      },
      context
    )
  );
};
