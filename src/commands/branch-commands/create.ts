import yargs from 'yargs';
import { createBranchAction } from '../../actions/create_branch';
import { graphite } from '../../lib/runner';

const args = {
  name: {
    type: 'string',
    positional: true,
    demandOption: false,
    optional: true,
    describe: 'The name of the new branch.',
    hidden: true,
  },
  message: {
    describe: `Commit staged changes on the new branch with this message.`,
    demandOption: false,
    type: 'string',
    alias: 'm',
  },
  all: {
    describe: `Stage all unstaged changes on the new branch with this message.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'a',
  },
  patch: {
    describe: `Pick hunks to stage before committing.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'p',
  },
  insert: {
    describe: `When true, any existing children of the current branch will become children of the new branch.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'i',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['c'];
export const command = 'create [name]';
export const canonical = 'branch create';
export const description =
  'Create a new branch stacked on top of the current branch and commit staged changes. If no branch name is specified but a commit message is passed, generate a branch name from the commit message.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    await createBranchAction(
      {
        branchName: argv.name,
        message: argv.message,
        all: argv.all,
        insert: argv.insert,
        patch: argv.patch,
      },
      context
    );
  });
};
