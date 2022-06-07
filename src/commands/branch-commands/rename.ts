import yargs from 'yargs';
import { renameCurrentBranch } from '../../actions/rename_branch';
import { profile } from '../../lib/telemetry/profile';

const args = {
  'new-branch-name': {
    describe: `The new name for the current branch`,
    demandOption: true,
    type: 'string',
    positional: true,
  },
  force: {
    describe: `Allow renaming a branch that is already associated with a GitHub pull request.`,
    demandOption: false,
    type: 'boolean',
    alias: 'f',
    default: false,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'rename <new-branch-name>';
export const canonical = 'branch rename';
export const description =
  'Rename a branch and update metadata referencing it.  Note that this removes any associated GitHub pull request.';
export const builder = args;

export const handler = async (args: argsT): Promise<void> =>
  profile(args, canonical, async (context) =>
    renameCurrentBranch(
      { newBranchName: args['new-branch-name'], force: args.force },
      context
    )
  );
