import yargs from 'yargs';
import { syncAction } from '../../actions/sync/sync';
import { graphite } from '../../lib/runner';

const args = {
  pull: {
    describe: `Pull the trunk branch from remote.`,
    demandOption: false,
    default: true,
    type: 'boolean',
    alias: 'p',
  },
  delete: {
    describe: `Delete branches which have been merged.`,
    demandOption: false,
    default: true,
    type: 'boolean',
    alias: 'd',
  },
  'show-delete-progress': {
    describe: `Show progress through merged branches.`,
    demandOption: false,
    default: false,
    type: 'boolean',
  },
  force: {
    describe: `Don't prompt for confirmation before deleting a branch.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'f',
  },
  restack: {
    describe: `Restack the current stack and any stacks with deleted branches.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'r',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'sync';
export const canonical = 'repo sync';
export const aliases = ['s'];
export const description =
  'Pull the trunk branch from remote and delete any branches that have been merged.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    await syncAction(
      {
        pull: argv.pull,
        force: argv.force,
        delete: argv.delete,
        showDeleteProgress: argv['show-delete-progress'],
        restack: argv.restack,
      },
      context
    );
  });
};
