import yargs from 'yargs';
import { syncAction } from '../../actions/sync/sync';
import { profile } from '../../lib/telemetry';

const args = {
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
  resubmit: {
    describe: `Re-submit branches whose merge bases have changed locally and now differ from their PRs.`,
    demandOption: false,
    default: true,
    type: 'boolean',
    alias: 'r',
  },
  force: {
    describe: `Don't prompt you to confirm when a branch will be deleted or re-submitted.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'f',
  },
  pull: {
    describe: `Pull the trunk branch from remote before searching for stale branches.`,
    demandOption: false,
    default: true,
    type: 'boolean',
    alias: 'p',
  },
  'show-dangling': {
    describe: `Show prompts to fix dangling branches (branches for whose parent is unknown to Graphite).`,
    demandOption: false,
    default: true,
    type: 'boolean',
    alias: 's',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'sync';
export const canonical = 'repo sync';
export const aliases = ['s'];
export const description =
  'Delete any branches that have been merged or squashed into the trunk branch, and recursively check for stack states against main.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    await syncAction(
      {
        pull: argv.pull,
        force: argv.force,
        resubmit: argv.resubmit,
        delete: argv.delete,
        showDeleteProgress: argv['show-delete-progress'],
        fixDanglingBranches: argv['show-dangling'],
      },
      context
    );
  });
};
