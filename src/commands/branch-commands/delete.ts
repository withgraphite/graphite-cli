import yargs from 'yargs';
import { deleteBranchAction } from '../../actions/delete_branch';
import { profile } from '../../lib/telemetry';
import { logTip } from '../../lib/utils';

const args = {
  name: {
    type: 'string',
    positional: true,
    demandOption: true,
    optional: false,
    describe: 'The name of the branch to delete.',
  },
  force: {
    describe: `Force delete the git branch.`,
    demandOption: false,
    type: 'boolean',
    alias: 'f',
    default: false,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['dl'];
export const command = 'delete [name]';
export const canonical = 'branch delete';
export const description =
  'Delete a given git branch and its corresponding Graphite metadata.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (!args.force) {
      logTip(`You can force branch deletion with -f`, context);
    }

    await deleteBranchAction({
      branchName: argv.name,
      force: argv.force,
    });
  });
};
